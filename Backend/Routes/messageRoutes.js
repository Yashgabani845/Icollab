const express = require("express");
const Message = require("../models/Message");
const router = express.Router();

// Send a new message
router.post("/:channelId/messages", async (req, res) => {
  const { channelId } = req.params;
  const { content, sender } = req.body;

  try {
    const message = new Message({ content, sender, channelId });
    await message.save();
    res.status(201).json(message);
  } catch (error) {
    res.status(500).json({ message: "Error sending message", error });
  }
});

// Get messages for a channel
router.get("/:channelId/messages", async (req, res) => {
  const { channelId } = req.params;

  try {
    const messages = await Message.find({ channelId });
    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: "Error fetching messages", error });
  }
});

module.exports = router;
