const express = require("express");
const router = express.Router();
const summarizer = require("../controllers/summaryController");

// Route to get channel summary
router.get("/workspaces/:workspaceName/channels/:channelId/summary", summarizer.getChannelSummary);

// Route to generate summary for arbitrary messages
router.post("/summarize", summarizer.generateSummary);

module.exports = router;