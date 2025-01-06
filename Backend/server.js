const mongoose = require('mongoose');
const express = require('express');
const cors = require('cors');

require('dotenv').config(); // Load environment variables
const User = require("./models/User")
// MongoDB Atlas connection string
const URI = process.env.MONGO_URI || 'mongodb+srv://YashGabani:Yash9182@cluster0.n77u6.mongodb.net/Icollab?retryWrites=true&w=majority&appName=Cluster0';

// Replace <username>, <password>, and <dbname> with your credentials
const connectDB = async () => {
  try {
    await mongoose.connect(URI); // No need for useNewUrlParser or useUnifiedTopology
    console.log('Connected to MongoDB Atlas');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error.message);
    process.exit(1); // Exit process with failure
  }
};

connectDB();

const app = express();

app.use(cors());

app.use(express.json());

app.get('/', (req, res) => {
  res.send('MongoDB Atlas Connection Successful!');
});
app.post('/api/signup', async (req, res) => {
    const { firstName, lastName, email, password } = req.body;
  
    // Validate request data
    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }
  
    try {
      // Check if the email already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: 'Email already exists' });
      }
  
      // Create a new user
      const newUser = new User({ firstName, lastName, email, password });
      await newUser.save();
  
      res.status(201).json({ message: 'User created successfully', user: newUser });
    } catch (error) {
      console.error('Error creating user:', error.message);
      res.status(500).json({ message: 'Internal server error' });
    }
  });
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
