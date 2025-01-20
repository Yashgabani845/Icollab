const mongoose = require('mongoose');
const express = require('express');
const cors = require('cors');
const jwt = require("jsonwebtoken");
require('dotenv').config(); // Load environment variables
const Workspace = require("./models/Workspace"); // Assuming Workspace model is in 'models' folder

require('dotenv').config(); 
const User = require("./models/User")
const TaskList = require('./models/TaskList');  
const { Server } = require('socket.io');
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

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

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
  const { name, description, createdBy } = req.body;

  if (!name || !description || !createdBy) {
    return res.status(400).json({ message: 'Name, description, and createdBy are required' });
  }

  try {
    const user = await User.findOne({ email: createdBy });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const newWorkspace = new Workspace({
      name,
      description,
      createdBy: user._id, 
    });

    const savedWorkspace = await newWorkspace.save();
    res.status(201).json(savedWorkspace);
  } catch (error) {
    console.error('Error creating workspace:', error);
    res.status(500).json({ message: 'Error creating workspace' });
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

    const workspaces = await Workspace.find({ createdBy: user._id });
    res.status(200).json(workspaces);
  } catch (error) {
    console.error('Error fetching workspaces:', error);
    res.status(500).json({ message: 'Failed to fetch workspaces' });
  }
});


io.on('connection', (socket) => {
  // Store user email when they connect
  socket.on('register', (email) => {
    socket.email = email;
    socket.join(email); // Join a room with their email
  });

  // Handle new message
  socket.on('sendMessage', async (data) => {
    try {
      const { content, receiverEmail, senderEmail, messageType = 'text' } = data;

      // Save message to database
      const newMessage = new Message({
        content,
        sender: senderEmail,
        receiver: receiverEmail,
        messageType,
        isRead: false,
      });

      await newMessage.save();

      // Emit the message to both sender and receiver
      io.to(receiverEmail).emit('newMessage', newMessage);
      io.to(senderEmail).emit('newMessage', newMessage);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  });

  // Mark messages as read
  socket.on('markAsRead', async (senderEmail) => {
    try {
      await Message.updateMany(
        { sender: senderEmail, receiver: socket.email, isRead: false },
        { isRead: true }
      );
      io.to(senderEmail).emit('messagesRead', socket.email);
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  });
});

// API Endpoints
// Update the messages endpoint to include pagination
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
      .sort({ createdAt: 1 }) // Re-sort to show oldest first
      .lean(); // For better performance

    res.json(messages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ message: 'Error fetching messages' });
  }
});

// Update the socket message handling
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

    // Only emit to the specific rooms
    socket.to(receiverEmail).emit('newMessage', messageToSend);
    socket.emit('newMessage', messageToSend); // Send to sender
  } catch (error) {
    console.error('Error sending message:', error);
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

server.listen(5001, () => {
  console.log('Server running on http://localhost:5000');
});
