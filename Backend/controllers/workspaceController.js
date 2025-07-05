const Workspace = require('../models/WorkSpace');
const User = require('../models/User');

exports.createWorkspace = async (req, res) => {
  const { name, description, members, createdBy } = req.body;

  if (!name || !description || !createdBy) {
    return res.status(400).json({ message: 'Name, description, and createdBy are required' });
  }

  try {
    const user = await User.findOne({ email: createdBy });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

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
            members: [user._id],
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
};

// Get all workspaces for a user
exports.getUserWorkspaces = async (req, res) => {
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
};

// Get members of a workspace
exports.getWorkspaceMembers = async (req, res) => {
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
};

// Get workspace by name
exports.getWorkspaceByName = async (req, res) => {
  try {
    const userId = req.query.userId;

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


    res.json({ ...workspace.toObject(), chat: { channels: workspace.chat.channels } });
  } catch (error) {
    console.error("Error fetching workspace:", error);
    res.status(500).json({ message: "Failed to fetch workspace" });
  }
};