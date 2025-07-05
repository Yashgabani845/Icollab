const User = require('../models/User');
const Workspace = require('../models/WorkSpace');
const jwt = require('jsonwebtoken');

// Get current user by token
exports.getCurrentUser = async (req, res) => {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) {
    return res.status(403).json({ message: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "yash1234");
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ email: user.email });
  } catch (error) {
    console.error('Error fetching user data:', error);
    res.status(500).json({ message: 'Failed to fetch user data' });
  }
};

// Get all users (for member selection)
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}, 'email _id');
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Failed to fetch users' });
  }
};

// Get user by ID
exports.getUserById = async (req, res) => {
  const { id } = req.params;

  try {
    const user = await User.findById(id).select("email name");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json(user);
  } catch (error) {
    console.error("Error fetching user by ID:", error);
    res.status(500).json({ message: "Failed to fetch user", error: error.message });
  }
};

// Get profile: user + workspaces
exports.getProfile = async (req, res) => {
  const { email } = req.query;
  if (!email) {
    return res.status(400).json({ message: "Email is required" });
  }

  try {
    // Fetch user details
    const user = await User.findOne({ email }).select("email firstName lastName role phone");
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
};