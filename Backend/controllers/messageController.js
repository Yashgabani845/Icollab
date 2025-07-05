const Workspace = require('../models/WorkSpace');
const User = require('../models/User');
const Message = require('../models/Message');
const { decode } = require('html-entities');
const axios = require('axios');

// Get messages for a workspace channel
exports.getChannelMessages = async (req, res) => {
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
};

// Post a message to a workspace channel (non-socket)
exports.postChannelMessage = async (req, res) => {
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

    const updatedWorkspace = await Workspace.findOne({ name: req.params.workspaceName })
      .populate({
        path: 'chat.channels.messages.sender',
        select: 'name email _id'
      });

    const updatedChannel = updatedWorkspace.chat.channels.id(req.params.channelId);
    const populatedMessage = updatedChannel.messages[updatedChannel.messages.length - 1];

    // If using socket, emit here
    // io.to(roomName).emit('newMessage', populatedMessage);

    res.status(201).json(populatedMessage);
  } catch (error) {
    console.error("Error sending message:", error);
    res.status(500).json({ message: "Failed to send message" });
  }
};

// Get summary for a workspace channel using AI summarizer
exports.getChannelSummary = async (req, res) => {
  try {
    const { workspaceName, channelId } = req.params;
    const { timeframe = 24 } = req.query;

    const workspace = await Workspace.findOne({ name: decodeURIComponent(workspaceName) })
      .populate('chat.channels.messages.sender', 'name email');

    if (!workspace) return res.status(404).json({ message: "Workspace not found" });

    const channel = workspace.chat.channels.id(channelId);
    if (!channel) return res.status(404).json({ message: "Channel not found" });

    const now = new Date();
    const timeframeStart = new Date(now.getTime() - timeframe * 60 * 60 * 1000);

    const recentMessages = channel.messages.filter(msg => new Date(msg.timestamp) >= timeframeStart);

    if (recentMessages.length === 0) {
      return res.status(200).json({ summary: "No recent messages to summarize." });
    }

    const formattedChat = recentMessages.map((msg) => {
      const senderName = msg.sender?.name || msg.sender?.email?.split('@')[0] || "User";
      return `${senderName}: ${msg.content}`;
    }).join('\n');

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
};

exports.getDirectMessages = async (req, res) => {
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
};