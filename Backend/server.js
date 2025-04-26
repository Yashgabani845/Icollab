const mongoose = require('mongoose');
const express = require('express');
const cors = require('cors');
const jwt = require("jsonwebtoken");
require('dotenv').config();
const Workspace = require("./models/WorkSpace");
const Project = require('./models/Project');
const axios = require('axios');
require('dotenv').config();
const User = require("./models/User")
const TaskList = require('./models/TaskList');
// const { Server } = require('socket.io');
const http = require('http');
const Message = require('./models/Message');
const nodemailer = require('nodemailer');
const Task = require('./models/Task');
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const URI = process.env.MONGO_URI || 'mongodb+srv://YashGabani:Yash9182@cluster0.n77u6.mongodb.net/Icollab?retryWrites=true&w=majority&appName=Cluster0';

const connectDB = async () => {
  try {
    await mongoose.connect(URI);
    console.log('Connected to MongoDB Atlas');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error.message);
    process.exit(1);
  }
};

connectDB();

// const server = http.createServer(app);
// const io = new Server(server, { cors: { origin: '*' } });
// Add this to your server.js or index.js file
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
app.use(cors({
  origin: 'http://localhost:3000', // Your React app URL
  credentials: true
}));

// Configure Socket.io with CORS
const io = socketIo(server, {
  cors: { 
    origin: 'http://localhost:3000',
    methods: ["GET", "POST"],
    credentials: true
  }
});
// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('New client connected');
  
  // Join a specific channel room
  socket.on('joinChannel', ({ channelId, workspaceName }) => {
    const roomName = `${workspaceName}-${channelId}`;
    socket.join(roomName);
    console.log(`User joined room: ${roomName}`);
  });
  
  // Leave a channel room
  socket.on('leaveChannel', ({ channelId, workspaceName }) => {
    const roomName = `${workspaceName}-${channelId}`;
    socket.leave(roomName);
    console.log(`User left room: ${roomName}`);
  });
  
  // Handle new messages
  socket.on('sendMessage', async ({ channelId, workspaceName, message }) => {
    try {
      const { senderId, content, senderName } = message;
      const roomName = `${workspaceName}-${channelId}`;
      
      // Find the workspace and channel
      const workspace = await Workspace.findOne({ name: workspaceName });
      if (!workspace) {
        return socket.emit('error', { message: "Workspace not found" });
      }
      
      const channel = workspace.chat.channels.id(channelId);
      if (!channel) {
        return socket.emit('error', { message: "Channel not found" });
      }
      
      // Find the user
      const user = await User.findOne({ email: senderId });
      if (!user) {
        return socket.emit('error', { message: "User not found" });
      }
      
      // Create and save the new message
      const newMessage = {
        sender: user._id,
        content,
        timestamp: new Date(),
      };
      
      channel.messages.push(newMessage);
      await workspace.save();
      
      // Get the populated message to broadcast
      const updatedWorkspace = await Workspace.findOne({ name: workspaceName })
        .populate({
          path: 'chat.channels.messages.sender',
          select: 'name email _id'
        });
      
      const updatedChannel = updatedWorkspace.chat.channels.id(channelId);
      const populatedMessage = updatedChannel.messages[updatedChannel.messages.length - 1];
      
      // Broadcast the message to everyone in the channel
      io.to(roomName).emit('newMessage', populatedMessage);
    } catch (error) {
      console.error("Error sending message via socket:", error);
      socket.emit('error', { message: "Failed to send message" });
    }
  });
  
  // Handle typing events
  socket.on('typing', ({ channelId, workspaceName, userId, isTyping }) => {
    console.log(`User Typing Event: ${userId} - Typing: ${isTyping}`);

    const roomName = `${workspaceName}-${channelId}`;
    // Broadcast to everyone except the sender
    socket.to(roomName).emit('userTyping', { userId, isTyping });
  });
  
  // Handle disconnection
  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

// Update your API routes for messages
app.get('/api/workspaces/:workspaceName/channels/:channelId/messages', async (req, res) => {
  try {
    const workspace = await Workspace.findOne({ name: req.params.workspaceName })
      .populate({
        path: 'chat.channels.messages.sender',
        select: 'name email _id'
      });

    if (!workspace) {
      return res.status(404).json({ message: "Workspace not found" });
    }

    const channel = workspace.chat.channels.id(req.params.channelId);

    if (!channel) {
      return res.status(404).json({ message: "Channel not found" });
    }

    res.status(200).json(channel.messages);
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({ message: "Failed to retrieve messages" });
  }
});

// POST endpoint still needed for non-socket clients or fallback
app.post('/api/workspaces/:workspaceName/channels/:channelId/messages', async (req, res) => {
  const { senderId, content } = req.body;
  
  if (!senderId || !content) {
    return res.status(400).json({ message: "Sender ID and message content are required" });
  }

  try {
    const workspace = await Workspace.findOne({ name: req.params.workspaceName });

    if (!workspace) {
      return res.status(404).json({ message: "Workspace not found" });
    }

    const channel = workspace.chat.channels.id(req.params.channelId);

    if (!channel) {
      return res.status(404).json({ message: "Channel not found" });
    }

    const user = await User.findOne({ email: senderId });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const newMessage = {
      sender: user._id,
      content,
      timestamp: new Date(),
    };

    channel.messages.push(newMessage);
    await workspace.save();
    
    // Get the populated message to return
    const updatedWorkspace = await Workspace.findOne({ name: req.params.workspaceName })
      .populate({
        path: 'chat.channels.messages.sender',
        select: 'name email _id'
      });
    
    const updatedChannel = updatedWorkspace.chat.channels.id(req.params.channelId);
    const populatedMessage = updatedChannel.messages[updatedChannel.messages.length - 1];

    // Emit the new message to all clients in the channel
    const roomName = `${req.params.workspaceName}-${req.params.channelId}`;
    io.to(roomName).emit('newMessage', populatedMessage);

    res.status(201).json(populatedMessage);
  } catch (error) {
    console.error("Error sending message:", error);
    res.status(500).json({ message: "Failed to send message" });
  }
});

// Update your server.listen to use the http server instead of app
const port =  5001;
server.listen(port, () => {
  console.log(`Server running on port ${PORT}`);
});
app.use(cors());
app.use(express.json());

// Test route for checking server status
app.get('/', (req, res) => {
  res.send('MongoDB Atlas Connection Successful!');
});

// User Signup Route
app.post('/api/signup', async (req, res) => {
  const { firstName, lastName, email, password } = req.body;

  if (!firstName || !lastName || !email || !password) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    const newUser = new User({ firstName, lastName, email, password, authType: 'local' });
    await newUser.save();
    const token = jwt.sign(
      { id: newUser._id, email: newUser.email },
      process.env.JWT_SECRET || "yash1234",
      { expiresIn: "1h" }
    );
    res.status(201).json({ message: 'User created successfully', user: newUser });
  } catch (error) {
    console.error('Error creating user:', error.message);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// User Login Route
app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.authType !== 'local') {
      return res.status(400).json({
        message: "This email is registered with Google. Please use Google Sign In."
      });
    }

    const isPasswordValid = password === user.password;
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET || "yash1234",
      { expiresIn: "1h" }
    );

    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
      },
    });
  } catch (error) {
    console.error("Error during login:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.get('/api/current-user', async (req, res) => {
  const token = req.headers['authorization']?.split(' ')[1]; // Get the token from the Authorization header
  if (!token) {
    return res.status(403).json({ message: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "yash1234"); // Decode the token
    const user = await User.findById(decoded.id); // Find the user based on the decoded user ID

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ email: user.email }); // Send the user's email back
  } catch (error) {
    console.error('Error fetching user data:', error);
    res.status(500).json({ message: 'Failed to fetch user data' });
  }
});

// Get all users (for member selection)
app.get('/api/users', async (req, res) => {
  try {
    const users = await User.find({}, 'email _id');
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Failed to fetch users' });
  }
});

app.get("/api/users/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const user = await User.findById(id).select("email name"); // Select only the required fields
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json(user);
  } catch (error) {
    console.error("Error fetching user by ID:", error);
    res.status(500).json({ message: "Failed to fetch user", error: error.message });
  }
});
// Create a new profile API that returns both user details and workspaces
app.get("/api/profile", async (req, res) => {
  const { email } = req.query;

  if (!email) {
    return res.status(400).json({ message: "Email is required" });
  }

  try {
    // Fetch user details
    const user = await User.findOne({ email }).select("email firstName lastName role phone"); // Adjust fields as needed
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Fetch workspaces created by the user
    const workspaces = await Workspace.find({ createdBy: user._id }).select("name description");
    if (!workspaces) {
      return res.status(404).json({ message: "No workspaces found" });
    }

    // Send both user details and workspaces
    res.status(200).json({ user, workspaces });
  } catch (error) {
    console.error("Error fetching profile:", error);
    res.status(500).json({ message: "Failed to fetch profile", error: error.message });
  }
});

// Google Signup Route
app.post('/api/google-signup', async (req, res) => {
  const { email, firstName, lastName, password, googleId } = req.body;

  try {
    let user = await User.findOne({ email });

    if (user) {
      if (user.authType === 'local') {
        return res.status(400).json({
          message: 'Email already exists with password login. Please use regular login.'
        });
      }

      const token = jwt.sign(
        { id: user._id, email: user.email },
        process.env.JWT_SECRET || "yash1234",
        { expiresIn: "1h" }
      );
      return res.json({ token, user });
    }

    user = new User({
      firstName,
      lastName,
      email,
      password,
      googleId,
      authType: 'google'
    });
    await user.save();

    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET || "yash1234",
      { expiresIn: "1h" }
    );

    res.status(201).json({
      message: 'User created successfully',
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName
      }
    });
  } catch (error) {
    console.error('Error during Google signup:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Google Login Route
app.post('/api/google-login', async (req, res) => {
  const { email, googleId } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        message: 'User not found. Please sign up first.'
      });
    }

    if (user.authType !== 'google') {
      return res.status(400).json({
        message: 'This email is registered with password login. Please use regular login.'
      });
    }

    if (user.googleId !== googleId) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET || "yash1234",
      { expiresIn: "1h" }
    );

    res.json({
      token,
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName
      }
    });
  } catch (error) {
    console.error('Error during Google login:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Workspace Routes
app.post('/api/workspaces', async (req, res) => {
  const {
    name,
    description,
    members,
    createdBy
  } = req.body;

  if (!name || !description || !createdBy) {
    return res.status(400).json({ message: 'Name, description, and createdBy are required' });
  }

  try {
    // Find the creating user
    const user = await User.findOne({ email: createdBy });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Process members: Find all users by their emails and get their ObjectIds
    let processedMembers = [];
    if (members && members.length > 0) {
      const memberEmails = members.map(member => member.userId);
      const memberUsers = await User.find({ email: { $in: memberEmails } });

      const emailToUserMap = memberUsers.reduce((map, user) => {
        map[user.email] = user._id;
        return map;
      }, {});

      processedMembers = members.map(member => {
        const userId = emailToUserMap[member.userId];
        if (!userId) {
          throw new Error(`User not found with email: ${member.userId}`);
        }
        return {
          userId,
          role: member.role,
        };
      });
    }

    const newWorkspace = new Workspace({
      name,
      description,
      createdBy: user._id,
      members: processedMembers,
      chat: {
        channels: [
          {
            name: "default",
            members: [user._id], // Add creator to default channel
            messages: []
          }
        ],
      },
      notifications: [],
    });

    const savedWorkspace = await newWorkspace.save();

    // Populate the response with user details for members
    const populatedWorkspace = await Workspace.findById(savedWorkspace._id)
      .populate('createdBy', 'email name')
      .populate('members.userId', 'email name');

    res.status(201).json(populatedWorkspace);
  } catch (error) {
    console.error('Error creating workspace:', error);
    res.status(500).json({ message: 'Error creating workspace', error: error.message });
  }
});

app.get("/api/workspaces", async (req, res) => {
  const { userEmail } = req.query;

  if (!userEmail) {
    return res.status(400).json({ message: "User email is required" });
  }

  try {
    const user = await User.findOne({ email: userEmail });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Find workspaces where user is either creator or member
    const workspaces = await Workspace.find({
      $or: [
        { createdBy: user._id },
        { 'members.userId': user._id },
      ],
    })
      .populate('createdBy', 'email name')
      .populate('members.userId', 'email name');

    res.status(200).json(workspaces);
  } catch (error) {
    console.error('Error fetching workspaces:', error);
    res.status(500).json({ message: 'Failed to fetch workspaces', error: error.message });
  }
});
app.get('/api/workspaces/:workspaceName/members', async (req, res) => {
  try {
    

    
    const workspace = await Workspace.findOne({ name: req.params.workspaceName });

    if (!workspace) {
      return res.status(404).json({ message: "Workspace not found" });
    }
    const members = await Promise.all(workspace.members.map(async (member) => {
      const usera = await User.findById(member.userId);
      return {
        _id: usera._id,
        firstName: usera.firstName,
        lastName: usera.lastName,
        email: usera.email,
        role: usera.role,
      };
    }));
    

    res.json(members);
  } catch (error) {    
    console.error('Error fetching workspace members:', error);
    res.status(500).json({ message: 'Failed to fetch workspace members', error: error.message });
  }
});

// Get workspace by name
app.get('/api/workspaces/:workspaceName', async (req, res) => {
  try {
    const userId = req.query.userId; // Get logged-in user's email from query params

    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    // Find user by email and get their ID
    const user = await User.findOne({ email: userId });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const uid = user._id.toString();

    // Find the workspace by name
    const workspace = await Workspace.findOne({ name: req.params.workspaceName });

    if (!workspace) {
      return res.status(404).json({ message: "Workspace not found" });
    }

    // Filter channels where the user is a member
    const filteredChannels = workspace.chat.channels.filter(channel =>
      channel.members.some(member => member._id.toString() === uid)
    );

    res.json({ ...workspace.toObject(), chat: { channels:  workspace.chat.channels } });
  } catch (error) {
    console.error("Error fetching workspace:", error);
    res.status(500).json({ message: "Failed to fetch workspace" });
  }
});

app.post('/api/workspaces/:workspaceName/channels/:channelId/messages', async (req, res) => {
  const { senderId, content } = req.body;
  console.log(senderId, content)
  if (!senderId || !content) {
    return res.status(400).json({ message: "Sender ID and message content are required" });
  }

  try {
    const workspace = await Workspace.findOne({ name: req.params.workspaceName });

    if (!workspace) {
      return res.status(404).json({ message: "Workspace not found" });
    }

    const channel = workspace.chat.channels.id(req.params.channelId);

    if (!channel) {
      return res.status(404).json({ message: "Channel not found" });
    }

    const user = await User.findOne({ email: senderId });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    

    const newMessage = {
      sender: user._id,
      content,
      timestamp: new Date(),
    };

    channel.messages.push(newMessage);
    await workspace.save();

    res.status(201).json(newMessage);
  } catch (error) {
    console.error("Error sending message:", error);
    res.status(500).json({ message: "Failed to send message" });
  }
});
const { decode } = require('html-entities'); // install if needed

app.get('/api/workspaces/:workspaceName/channels/:channelId/summary', async (req, res) => {
  try {
    const { workspaceName, channelId } = req.params;
    const { timeframe = 24 } = req.query; // timeframe in hours

    const workspace = await Workspace.findOne({ name: decodeURIComponent(workspaceName) })
      .populate('chat.channels.messages.sender', 'name email');

    if (!workspace) return res.status(404).json({ message: "Workspace not found" });

    const channel = workspace.chat.channels.id(channelId);
    if (!channel) return res.status(404).json({ message: "Channel not found" });

    // Filter messages based on timeframe
    const now = new Date();
    const timeframeStart = new Date(now.getTime() - timeframe * 60 * 60 * 1000);

    const recentMessages = channel.messages.filter(msg => new Date(msg.timestamp) >= timeframeStart);

    if (recentMessages.length === 0) {
      return res.status(200).json({ summary: "No recent messages to summarize." });
    }

    // Format messages into chat text (as expected by summarizer model)
    const formattedChat = recentMessages.map((msg) => {
      const senderName = msg.sender?.name || msg.sender?.email?.split('@')[0] || "User";
      return `${senderName}: ${msg.content}`;
    }).join('\n');

    console.log("Formatted Chat sent to Summarizer Service:", formattedChat.substring(0, 500)); // optional: print preview

    // Send to Summarizer Service
    const response = await axios.post('http://localhost:5002/summarize', {
      chat: formattedChat
    });

    if (response.data && response.data.summary) {
      res.status(200).json({ summary: response.data.summary });
    } else {
      res.status(500).json({ message: "Failed to summarize chat" });
    }
  } catch (error) {
    console.error("Error summarizing chat:", error);
    res.status(500).json({ message: "Failed to summarize chat", error: error.message });
  }
});
app.get('/api/workspaces/:workspaceName/channels/:channelId/messages', async (req, res) => {
  try {
    const workspace = await Workspace.findOne({ name: req.params.workspaceName });

    if (!workspace) {
      return res.status(404).json({ message: "Workspace not found" });
    }

    const channel = workspace.chat.channels.id(req.params.channelId);

    if (!channel) {
      return res.status(404).json({ message: "Channel not found" });
    }

    res.status(200).json(channel.messages);
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({ message: "Failed to retrieve messages" });
  }
});


// Create a new channel in a workspace
app.post('/api/workspaces/:workspaceName/channels', async (req, res) => {
  const { name, description, members } = req.body;

  if (!name || !description) {
    return res.status(400).json({ message: 'Name and description are required' });
  }

  try {
    const workspace = await Workspace.findOne({ name: req.params.workspaceName });

    if (!workspace) {
      return res.status(404).json({ message: 'Workspace not found' });
    }

    // Validate member IDs
    const validMembers = await User.find({ _id: { $in: members } });
    const memberIds = validMembers.map(user => user._id);

    const newChannel = {
      name,
      description,
      members: memberIds,
      messages: [],
    };

    workspace.chat.channels.push(newChannel);
    await workspace.save();

    res.status(201).json(newChannel);
  } catch (error) {
    console.error('Error creating channel:', error);
    res.status(500).json({ message: 'Failed to create channel' });
  }
});



app.get('/api/tasklist/:taskListId', async (req, res) => {
  try {
    const { taskListId } = req.params;
    console.log(taskListId)
    // Fetch the TaskList by ID
    const taskList = await TaskList.findById(taskListId);
    console.log(taskList)
    // If not found, return an error
    if (!taskList) {
      return res.status(404).json({ error: 'TaskList not found' });
    }

    // Return the taskList
    res.status(200).json(taskList);
  } catch (error) {
    console.error('Error fetching task list:', error);
    res.status(500).json({ error: 'Failed to fetch task list' });
  }
});

app.get('/api/tasklists', async (req, res) => {
  const { userEmail } = req.query;
  console.log(userEmail)
  const user = await User.findOne({ email: userEmail });
  try {
    const taskLists = await TaskList.find({ createdBy: user._id });
    res.json(taskLists);
  } catch (error) {
    console.error('Error fetching task lists:', error);
    res.status(500).json({ message: 'Failed to fetch task lists' });
  }
});
app.post('/api/tasklists', async (req, res) => {
  const { title, cards, createdBy } = req.body;
  const create = await User.findOne({ email: createdBy });
  if (!title || !cards || !create) {
    return res.status(400).json({ message: 'Title and cards are required' });
  }
  try {
    const newTaskList = new TaskList({
      name: title,
      createdBy: create._id,
      createdAt: Date.now(),
      tasks: cards,
    });
    const savedList = await newTaskList.save();
    res.status(201).json(savedList);
  } catch (error) {
    console.error('Error adding new task list:', error);
    res.status(500).json({ message: 'Failed to add a new task list' });
  }
});
app.get('/api/task/:taskId', async (req, res) => {
  try {
    const { taskId } = req.params;

    // Fetch the task from the database
    const task = await Task.findById(taskId).populate("createdBy").populate("taskListId");

    if (!task) {
      return res.status(404).json({ error: "Task not found" });
    }

    res.status(200).json(task);
  } catch (error) {
    console.error("Error fetching task:", error);
    res.status(500).json({ error: "Failed to fetch task" });
  }
});

app.get('/api/tasks', async (req, res) => {
  const { taskListName, userEmail } = req.query;

  try {
    // Step 1: Fetch TaskList by Name
    const taskList = await TaskList.findOne({ name: taskListName });

    if (!taskList) {
      return res.status(400).json({ error: 'TaskList not found' });
    }

    // Step 2: Fetch User by Email
    const user = await User.findOne({ email: userEmail });

    if (!user) {
      return res.status(400).json({ error: 'User not found' });
    }

    // Step 3: Extract All Task IDs from the TaskList
    const taskIds = taskList.tasks; // Assuming taskList.tasks is an array of task _ids

    if (!taskIds || taskIds.length === 0) {
      return res.status(200).json([]); // No tasks found, return empty array
    }

    // Step 4: Fetch and Filter Tasks in MongoDB Query
    const userTasks = await Task.find({
      _id: { $in: taskIds }, 
      createdBy: user._id,  // Ensure filtering happens at the DB level
    });

    // Step 5: Return Filtered Tasks
    res.status(200).json(userTasks);

  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
});
app.post('/api/tasks', async (req, res) => {
  const { title, description, priority, createdBy, Tasklist } = req.body;

  try {
    console.log(req.body);

    // Step 1: Find User
    const user = await User.findOne({ email: createdBy });
    if (!user) {
      return res.status(400).json({ error: 'User not found' });
    }

    // Step 2: Find TaskList
    const taskList = await TaskList.findOne({ name: Tasklist });
    if (!taskList) {
      return res.status(400).json({ error: 'TaskList not found' });
    }

    // Step 3: Ensure the task with the same title does not exist
    const existingTask = await Task.findOne({
      title,
      taskListId: taskList._id, 
      createdBy: user._id, 
    });

    if (existingTask) {
      return res.status(400).json({ error: 'A task with this title already exists in this task list' });
    }

    // Step 4: Create and Save New Task
    const newTask = new Task({
      title,
      description,
      assignedTo: [],
      priority,
      labels: [],
      checklist: [],
      taskListId: taskList._id,
      createdBy: user._id,
    });

    await newTask.save();

    // Step 5: Push New Task ID to TaskList and Save
    taskList.tasks.push(newTask._id);
    await taskList.save();

    res.status(201).json(newTask);
  } catch (error) {
    console.error('Error creating task:', error);
    res.status(500).json({ error: 'Failed to create task' });
  }
});

app.get("/api/channels/:workspaceName", async (req, res) => {
  try {
    const wname = req.params.workspacename;
    const wspace = Workspace.find({ name: wname });
    const channels = await Channel.find({ workspace: wspace._id });
    res.json(channels);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/channels", async (req, res) => {
  try {
    const { name, workspace, createdBy } = req.body;
    if (!name || !workspace || !createdBy) {
      return res.status(400).json({ error: "All fields are required" });
    }
    const user = await User.findOne({ email: createdBy });
    console.log(user)
    const uid = user._id;
    const wspace = Workspace.find({ name: workspace });
    console.log(wspace)
    const wid = wspace._id;
    const newChannel = new Channel({ name: name, workspace: wid, createdBy: uid });
    await newChannel.save();
    res.status(201).json(newChannel);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err.message });
  }
});




// io.on('connection', (socket) => {
//   // Store user email when they connect
//   socket.on('register', (email) => {
//     socket.email = email;
//     socket.join(email); // Join a room with their email
//   });

//   // Handle new message
//   socket.on('sendMessage', async (data) => {
//     try {
//       const { content, receiverEmail, senderEmail, messageType = 'text' } = data;

//       // Save message to database
//       const newMessage = new Message({
//         content,
//         sender: senderEmail,
//         receiver: receiverEmail,
//         messageType,
//         isRead: false,
//       });

//       await newMessage.save();

//       // Emit the message to both sender and receiver
//       io.to(receiverEmail).emit('newMessage', newMessage);
//       io.to(senderEmail).emit('newMessage', newMessage);
//     } catch (error) {
//       console.error('Error sending message:', error);
//     }
//   });
//   socket.on('markAsRead', async (senderEmail) => {
//     try {
//       await Message.updateMany(
//         { sender: senderEmail, receiver: socket.email, isRead: false },
//         { isRead: true }
//       );
//       io.to(senderEmail).emit('messagesRead', socket.email);
//     } catch (error) {
//       console.error('Error marking messages as read:', error);
//     }
//   });
// });

app.post('/api/projects', async (req, res) => {
  try {
    const { repositoryUrl ,workspaceId,addedBy} = req.body;
    console.log(repositoryUrl ,workspaceId,addedBy)
        // Validate URL format
    if (!repositoryUrl.match(/^https:\/\/github\.com\/[^/]+\/[^/]+$/)) {
      return res.status(400).json({ message: 'Invalid GitHub repository URL' });
    }
    
    // Extract owner and repo name from URL
    const urlParts = repositoryUrl.split('/');
    const owner = urlParts[urlParts.length - 2];
    const repoName = urlParts[urlParts.length - 1];
    
    // Check if project already exists
    const existingProject = await Project.findOne({ repositoryUrl });
    if (existingProject) {
      return res.status(400).json({ message: 'Project already exists' });
    }
    
    // Fetch repository data from GitHub API
    const repoResponse = await axios.get(`https://api.github.com/repos/${owner}/${repoName}`);
    const repoData = repoResponse.data;
    
    // Fetch pull requests
    const prResponse = await axios.get(`https://api.github.com/repos/${owner}/${repoName}/pulls?state=all&per_page=100`);
    const pullRequests = prResponse.data.map(pr => ({
      id: pr.id,
      title: pr.title,
      url: pr.html_url,
      state: pr.state === 'closed' && pr.merged_at ? 'merged' : pr.state,
      createdAt: pr.created_at,
      updatedAt: pr.updated_at,
      repository: repositoryUrl
    }));
    
    // Fetch issues
    const issueResponse = await axios.get(`https://api.github.com/repos/${owner}/${repoName}/issues?state=all&per_page=100`);
    const issues = issueResponse.data
      .filter(issue => !issue.pull_request) // Filter out pull requests that appear in issues list
      .map(issue => ({
        id: issue.id,
        title: issue.title,
        url: issue.html_url,
        state: issue.state,
        createdAt: issue.created_at,
        updatedAt: issue.updated_at,
        repository: repositoryUrl
      }));
    const usera = await User.findOne({ email: addedBy });
    console.log("User", usera)
    // Create new project
    const newProject = new Project({
      repositoryUrl,
      name: repoData.name,
      description: repoData.description,
      owner,
      stars: repoData.stargazers_count,
      forks: repoData.forks_count,
      pullRequests,
      issues,
      workspace:workspaceId ,
      addedBy: usera._id ,
      lastSynced: new Date()
    });
    
    await newProject.save();
    
    res.status(201).json(newProject);
  } catch (error) {
    console.error('Error adding project:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get all projects for a workspace
app.get('/api/workspaces/:workspaceId/projects', async (req, res) => {
  try {
    const projects = await Project.find({ workspace: req.params.workspaceId });
    res.json(projects);
  } catch (error) {
    console.error('Error fetching projects:', error);
    res.status(500).json({ message: 'Server error' });
  }
});
app.get('/api/workspaces/:workspaceId/users', async (req, res) => {
  try {
    const { workspaceId } = req.params;

    const workspace = await Workspace.findById(workspaceId).populate('members.userId', '-password');

    if (!workspace) {
      return res.status(404).json({ message: 'Workspace not found' });
    }

    const users = workspace.members.map(member => ({
      _id: member.userId._id,
      firstName: member.userId.firstName,
      lastName: member.userId.lastName,
      email: member.userId.email,
      avatar: member.userId.avatar,
      status: member.userId.status,
      role: member.role, 
    }));

    res.status(200).json(users);
  } catch (error) {
    console.error('Error fetching workspace users:', error);
    res.status(500).json({ message: 'Server error' });
  }
});
app.get('/api/workspaces/name/:workspaceName/users', async (req, res) => {
  try {
    const { workspaceName } = req.params;

    const workspace = await Workspace.findOne({ name: workspaceName }).populate('members.userId', '-password');

    if (!workspace) {
      return res.status(404).json({ message: 'Workspace not found' });
    }

    const users = workspace.members.map(member => ({
      _id: member.userId._id,
      firstName: member.userId.firstName,
      lastName: member.userId.lastName,
      email: member.userId.email,
      avatar: member.userId.avatar,
      status: member.userId.status,
      role: member.role,
    }));

    res.status(200).json(users);
  } catch (error) {
    console.error('Error fetching workspace users:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Assign PR or issue to a user
app.patch('/api/projects/:projectId/:type/:itemId/assign', async (req, res) => {
  try {
    const { projectId, type, itemId } = req.params;
    const { userId } = req.body;
    
    const project = await Project.findById(projectId);
    
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    
    if (type === 'pullrequest') {
      const pr = project.pullRequests.id(itemId);
      if (!pr) {
        return res.status(404).json({ message: 'Pull request not found' });
      }
      pr.assignee = userId;
    } else if (type === 'issue') {
      const issue = project.issues.id(itemId);
      if (!issue) {
        return res.status(404).json({ message: 'Issue not found' });
      }
      issue.assignee = userId;
    } else {
      return res.status(400).json({ message: 'Invalid type. Must be pullrequest or issue' });
    }
    
    await project.save();
    
    res.json(project);
  } catch (error) {
    console.error('Error assigning item:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/api/messages/:userEmail', async (req, res) => {
  try {
    const { userEmail } = req.params;
    const { with: withEmail, limit = 50, page = 1 } = req.query;

    const messages = await Message.find({
      $or: [
        { sender: userEmail, receiver: withEmail },
        { sender: withEmail, receiver: userEmail },
      ],
    })
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((page - 1) * parseInt(limit))
      .sort({ createdAt: 1 })
      .lean();

    res.json(messages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ message: 'Error fetching messages' });
  }
});

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, "../uploads");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    cb(
      null,
      file.fieldname + "-" + Date.now() + path.extname(file.originalname)
    );
  },
});

const upload = multer({ storage: storage });

// Get a specific task with all details
app.get("/api/tasks/:taskId", async (req, res) => {
  try {
    const task = await Task.findById(req.params.taskId)
      .populate("createdBy", "firstName lastName avatar")
      .populate("assignedTo", "firstName lastName avatar")
      .populate({
        path: "comments",
        populate: {
          path: "user",
          select: "firstName lastName avatar",
        },
      });

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    res.json(task);
  } catch (error) {
    console.error("Error fetching task:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Update task description
app.put("/api/tasks/:taskId/description", async (req, res) => {
  try {
    const { description } = req.body;
    const task = await Task.findByIdAndUpdate(
      req.params.taskId,
      { description },
      { new: true }
    );

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    res.json(task);
  } catch (error) {
    console.error("Error updating description:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Add a checklist item
app.post("/api/tasks/:taskId/checklist", async (req, res) => {
  try {
    const { title , user } = req.body;
    const task = await Task.findById(req.params.taskId);
    const userId = await User.findOne({email: user});
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    const newChecklistItem = {
      title,
      status: false,
      createdBy: userId._id, // From auth middleware
    };

    task.checklist.push(newChecklistItem);
    await task.save();

    // Return the newly created checklist item
    res.status(201).json(task.checklist[task.checklist.length - 1]);
  } catch (error) {
    console.error("Error adding checklist item:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Update a checklist item
app.put("/api/tasks/:taskId/checklist/:itemId", async (req, res) => {
  try {
    const { status } = req.body;
    const task = await Task.findById(req.params.taskId);

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    const checklistItem = task.checklist.id(req.params.itemId);
    if (!checklistItem) {
      return res.status(404).json({ message: "Checklist item not found" });
    }

    checklistItem.status = status;
    await task.save();

    res.json(checklistItem);
  } catch (error) {
    console.error("Error updating checklist item:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Delete a checklist item
app.delete("/api/tasks/:taskId/checklist/:itemId", async (req, res) => {
  try {
    const task = await Task.findById(req.params.taskId);

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    task.checklist = task.checklist.filter(
      (item) => item._id.toString() !== req.params.itemId
    );
    await task.save();

    res.json({ message: "Checklist item deleted" });
  } catch (error) {
    console.error("Error deleting checklist item:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Add a label
app.post("/api/tasks/:taskId/labels", async (req, res) => {
  try {
    const { label } = req.body;
    const task = await Task.findById(req.params.taskId);

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    if (!task.labels.includes(label)) {
      task.labels.push(label);
      await task.save();
    }

    res.json({ labels: task.labels });
  } catch (error) {
    console.error("Error adding label:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Remove a label
app.delete("/api/tasks/:taskId/labels/:label", async (req, res) => {
  try {
    const label = decodeURIComponent(req.params.label);
    const task = await Task.findById(req.params.taskId);

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    task.labels = task.labels.filter((l) => l !== label);
    await task.save();

    res.json({ labels: task.labels });
  } catch (error) {
    console.error("Error removing label:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Update task due date
app.put("/api/tasks/:taskId/deadline", async (req, res) => {
  try {
    const { deadline } = req.body;
    const task = await Task.findById(req.params.taskId);

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    task.dates.deadline = deadline; // null will remove the deadline
    await task.save();

    res.json(task);
  } catch (error) {
    console.error("Error updating deadline:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Add a comment
app.post("/api/tasks/:taskId/comments", async (req, res) => {
  try {
    const { text,user } = req.body;
    const task = await Task.findById(req.params.taskId);
    const userId = await User.findOne({email: user});
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    const newComment = {
      text,
      user: userId._id, // From auth middleware
      time: new Date(),
    };

    task.comments.push(newComment);
    await task.save();

    // Populate the user info for the new comment
    const populatedTask = await Task.findById(req.params.taskId).populate({
      path: "comments.user",
      select: "firstName lastName avatar",
      match: { _id: req.user.id },
    });

    // Get the newly created comment
    const createdComment = populatedTask.comments[populatedTask.comments.length - 1];

    res.status(201).json(createdComment);
  } catch (error) {
    console.error("Error adding comment:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Delete a comment
app.delete("/api/tasks/:taskId/comments/:commentId", async (req, res) => {
  try {
    const task = await Task.findById(req.params.taskId);

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    // Ensure the user can only delete their own comments or they're an admin
    const comment = task.comments.id(req.params.commentId);
    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    if (comment.user.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized to delete this comment" });
    }

    task.comments = task.comments.filter(
      (c) => c._id.toString() !== req.params.commentId
    );
    await task.save();

    res.json({ message: "Comment deleted" });
  } catch (error) {
    console.error("Error deleting comment:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Upload task attachment
app.post("/api/tasks/:taskId/attachments", upload.single("attachment"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const task = await Task.findById(req.params.taskId);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    // Create URL for the file
    const fileUrl = `/uploads/${req.file.filename}`;
    
    task.attachments.push(fileUrl);
    await task.save();

    res.json({ url: fileUrl });
  } catch (error) {
    console.error("Error uploading attachment:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Delete task attachment
app.delete("/api/tasks/:taskId/attachments", async (req, res) => {
  try {
    const { url } = req.body;
    const task = await Task.findById(req.params.taskId);

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    task.attachments = task.attachments.filter((a) => a !== url);
    await task.save();

    // Optionally delete the actual file
    const filePath = path.join(__dirname, "..", url);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    res.json({ message: "Attachment deleted" });
  } catch (error) {
    console.error("Error deleting attachment:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Upload cover photo
app.post("/api/tasks/:taskId/cover", upload.single("cover"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const task = await Task.findById(req.params.taskId);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    // Create URL for the file
    const fileUrl = `/uploads/${req.file.filename}`;
    
    // Remove old cover photo file if it exists
    if (task.coverPhoto && task.coverPhoto.startsWith("/uploads/")) {
      const oldFilePath = path.join(__dirname, "..", task.coverPhoto);
      if (fs.existsSync(oldFilePath)) {
        fs.unlinkSync(oldFilePath);
      }
    }

    task.coverPhoto = fileUrl;
    await task.save();

    res.json({ url: fileUrl });
  } catch (error) {
    console.error("Error uploading cover photo:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Update cover (for color or URL)
app.put("/api/tasks/:taskId/cover", async (req, res) => {
  try {
    const { coverPhoto } = req.body;
    const task = await Task.findById(req.params.taskId);

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    // Remove old cover photo file if it exists and we're removing/changing the cover
    if (
      task.coverPhoto && 
      task.coverPhoto.startsWith("/uploads/") && 
      coverPhoto !== task.coverPhoto
    ) {
      const oldFilePath = path.join(__dirname, "..", task.coverPhoto);
      if (fs.existsSync(oldFilePath)) {
        fs.unlinkSync(oldFilePath);
      }
    }

    task.coverPhoto = coverPhoto;
    await task.save();

    res.json(task);
  } catch (error) {
    console.error("Error updating cover photo:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Move task to a different list
app.put("/api/tasks/:taskId/move", async (req, res) => {
  try {
    const { taskListId } = req.body;
    const task = await Task.findById(req.params.taskId);
    
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    // Verify the new list exists
    const destinationList = await TaskList.findById(taskListId);
    if (!destinationList) {
      return res.status(404).json({ message: "Destination list not found" });
    }

    // Find the original list to remove task
    const originalList = await TaskList.findById(task.taskListId);
    if (originalList) {
      originalList.tasks = originalList.tasks.filter(
        (t) => t.toString() !== req.params.taskId
      );
      await originalList.save();
    }

    // Add task to new list
    if (!destinationList.tasks.includes(req.params.taskId)) {
      destinationList.tasks.push(req.params.taskId);
      await destinationList.save();
    }

    // Update task's list reference
    task.taskListId = taskListId;
    await task.save();

    res.json(task);
  } catch (error) {
    console.error("Error moving task:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Delete/Archive task
app.delete("/api/tasks/:taskId", async (req, res) => {
  try {
    const task = await Task.findById(req.params.taskId);
    
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    // Remove task from its list
    await TaskList.findByIdAndUpdate(
      task.taskListId,
      { $pull: { tasks: req.params.taskId } }
    );

    // Delete the task
    await Task.findByIdAndDelete(req.params.taskId);

    res.json({ message: "Task deleted successfully" });
  } catch (error) {
    console.error("Error deleting task:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Add/remove members from a task
app.put("/api/tasks/:taskId/members", async (req, res) => {
  try {
    const { userId, action } = req.body;
    
    if (!["add", "remove"].includes(action)) {
      return res.status(400).json({ message: "Invalid action" });
    }

    const task = await Task.findById(req.params.taskId);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (action === "add" && !task.assignedTo.includes(userId)) {
      task.assignedTo.push(userId);
    } else if (action === "remove") {
      task.assignedTo = task.assignedTo.filter(id => id.toString() !== userId);
    }

    await task.save();

    // Return updated task with populated member info
    const updatedTask = await Task.findById(req.params.taskId)
      .populate("assignedTo", "firstName lastName avatar");

    res.json(updatedTask);
  } catch (error) {
    console.error("Error updating task members:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get all available users for assignment
app.get("/users/available", async (req, res) => {
  try {
    const users = await User.find({}, "firstName lastName avatar");
    res.json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ message: "Server error" });
  }
});


io.on('sendMessage', async (data) => {
  try {
    const { content, receiverEmail, senderEmail, messageType = 'text' } = data;

    const newMessage = new Message({
      content,
      sender: senderEmail,
      receiver: receiverEmail,
      messageType,
      isRead: false,
      createdAt: new Date(),
    });

    const savedMessage = await newMessage.save();
    const messageToSend = await Message.findById(savedMessage._id).lean();

    socket.to(receiverEmail).emit('newMessage', messageToSend);
    socket.emit('newMessage', messageToSend);
  } catch (error) {
    console.error('Error sending message:', error);
  }
});


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

// server.listen(5001, () => {
//   console.log('Server running on http://localhost:5001');
// });
