const mongoose = require('mongoose');
const express = require('express');
const cors = require('cors');
const jwt = require("jsonwebtoken");
require('dotenv').config();
const Workspace = require("./models/WorkSpace");

require('dotenv').config();
const User = require("./models/User")
const TaskList = require('./models/TaskList');
// const { Server } = require('socket.io');
const http = require('http');
const Message = require('./models/Message');
const nodemailer = require('nodemailer');
const Task = require('./models/Task');

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
    const user = await User.findOne({ email }).select("email name role phone"); // Adjust fields as needed
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Fetch workspaces created by the user
    const workspaces = await Workspace.find({ createdBy: user._id });
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




app.get('/api/tasklists', async (req, res) => {
  const { userEmail } = req.query;
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
app.get('/api/tasks', async (req, res) => {
  const { taskListName, userEmail } = req.query;
  console.log(req.query)
  try {
    const taskList = await TaskList.findOne({ name: taskListName });
    if (!taskList) {
      return res.status(400).json({ error: 'TaskList not found' });
    }
    const user = await User.findOne({ email: userEmail });
    if (!user) {
      return res.status(400).json({ error: 'User not found' });
    }
    console.log(user, taskList)
    const tasks = await Task.find({
      createdBy: user._id,
      taskListId: taskList._id,
    })
    console.log(tasks)
    res.status(200).json(tasks);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
});
app.post('/api/tasks', async (req, res) => {
  const { title, description, priority, createdBy, Tasklist } = req.body;
  try {
    // Find the TaskList by its name
    console.log(req.body)
    const user = await User.findOne({ email: createdBy });
    if (!user) {
      return res.status(400).json({ error: 'User not found' });
    }
    const taskList = await TaskList.findOne({ name: Tasklist, createdBy: user._id });
    console.log(taskList)
    if (!taskList) {
      return res.status(400).json({ error: 'TaskList not found' });
    }
    // Find the User by their email

    // Check if the task with the same title already exists in the TaskList for the given user
    const existingTask = await Task.findOne({
      createdBy: user._id,
      taskListId: taskList._id,
      title,
    });
    if (existingTask) {
      return res.status(400).json({ error: 'A task with this title already exists in this task list' });
    }
    // Create and save the new task
    const newTask = new Task({
      title,
      description,
      assignedTo: [],
      priority,
      labels: [],
      checklist: [],
      taskListId: taskList._id, // Tied to the task list
      createdBy: user._id, // User creating the task
    });
    await newTask.save();
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
