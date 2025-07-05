const Workspace = require("../models/Workspace");
const { summarizeChat } = require("../utils/chatSummarizer");

exports.getChannelSummary = async (req, res) => {
  try {
    const { workspaceName, channelId } = req.params;
    const { timeframe = 24 } = req.query;

    const workspace = await Workspace.findOne({ name: workspaceName });
    
    if (!workspace) {
      return res.status(404).json({ message: "Workspace not found" });
    }

    const channel = workspace.chat.channels.id(channelId);
    
    if (!channel) {
      return res.status(404).json({ message: "Channel not found" });
    }

    const timeframeMs = parseInt(timeframe) * 60 * 60 * 1000; 
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


exports.generateSummary = async (req, res) => {
  try {
    const { messages } = req.body;
    
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ message: "Valid messages array required" });
    }

    const summary = await summarizeChat(messages);
    
    res.json({ summary, messageCount: messages.length });
  } catch (error) {
    console.error("Error generating summary:", error);
    res.status(500).json({ message: "Error generating summary" });
  }
};