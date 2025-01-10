const express = require("express");
const Channel = require("../models/Channel");
const router = express.Router();

// Create a new channel
router.post("/:workspaceId/channels", async (req, res) => {
  const { workspaceId } = req.params;
  const { name } = req.body;

  try {
    const channel = new Channel({ name, workspaceId });
    await channel.save();
    res.status(201).json(channel);
  } catch (error) {
    res.status(500).json({ message: "Error creating channel", error });
  }
});

// Get channels for a workspace
router.get("/:workspaceId/channels", async (req, res) => {
  const { workspaceId } = req.params;

  try {
    const channels = await Channel.find({ workspaceId });
    res.json(channels);
  } catch (error) {
    res.status(500).json({ message: "Error fetching channels", error });
  }
});

module.exports = router;
