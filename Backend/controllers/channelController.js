const Workspace = require('../models/WorkSpace');
const User = require('../models/User');

// Create a new channel in a workspace
exports.createChannel = async (req, res) => {
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
};

// Get all channels for a workspace (by workspaceName)
exports.getChannelsByWorkspaceName = async (req, res) => {
  try {
    const wname = req.params.workspaceName;
    const workspace = await Workspace.findOne({ name: wname });
    if (!workspace) return res.status(404).json({ message: "Workspace not found" });
    res.json(workspace.chat.channels);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// For separate Channel model (if used)
exports.createChannelModel = async (req, res) => {
  try {
    const { name, workspace, createdBy } = req.body;
    if (!name || !workspace || !createdBy) {
      return res.status(400).json({ error: "All fields are required" });
    }
    const user = await User.findOne({ email: createdBy });
    if (!user) return res.status(404).json({ error: "User not found" });
    const wspace = await Workspace.findOne({ name: workspace });
    if (!wspace) return res.status(404).json({ error: "Workspace not found" });
    const newChannel = new Channel({ name, workspace: wspace._id, createdBy: user._id });
    await newChannel.save();
    res.status(201).json(newChannel);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err.message });
  }
};