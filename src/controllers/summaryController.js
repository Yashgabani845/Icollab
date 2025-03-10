const Workspace = require("../models/Workspace");
const { summarizeChat } = require("../utils/chatSummarizer");

/**
 * Get a summary of recent chat messages for a specific channel
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getChannelSummary = async (req, res) => {
  try {
    const { workspaceName, channelId } = req.params;
    const { timeframe = 24 } = req.query; // Default timeframe: 24 hours

    // Find the workspace and channel
    const workspace = await Workspace.findOne({ name: workspaceName });
    
    if (!workspace) {
      return res.status(404).json({ message: "Workspace not found" });
    }

    // Find the channel in the workspace
    const channel = workspace.chat.channels.id(channelId);
    
    if (!channel) {
      return res.status(404).json({ message: "Channel not found" });
    }

    // Get messages from the specified timeframe
    const timeframeMs = parseInt(timeframe) * 60 * 60 * 1000; // Convert hours to milliseconds
    const cutoffTime = new Date(Date.now() - timeframeMs);
    
    const recentMessages = channel.messages.filter(
      msg => new Date(msg.timestamp) >= cutoffTime
    );

    if (recentMessages.length === 0) {
      return res.json({ 
        summary: "No messages in the specified timeframe.",
        messageCount: 0,
        timeframe: `${timeframe} hours`
      });
    }

    // Generate summary using the helper function
    const summary = await summarizeChat(recentMessages);

    res.json({
      summary,
      messageCount: recentMessages.length,
      timeframe: `${timeframe} hours`,
      channelName: channel.name
    });
  } catch (error) {
    console.error("Error generating channel summary:", error);
    res.status(500).json({ message: "Error generating summary" });
  }
};

/**
 * Generate a summary for an array of messages
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.generateSummary = async (req, res) => {
  try {
    const { messages } = req.body;
    
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ message: "Valid messages array required" });
    }

    // Generate summary
    const summary = await summarizeChat(messages);
    
    res.json({ summary, messageCount: messages.length });
  } catch (error) {
    console.error("Error generating summary:", error);
    res.status(500).json({ message: "Error generating summary" });
  }
};