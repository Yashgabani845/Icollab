const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');

// Get messages for a workspace channel
router.get('/workspaces/:workspaceName/channels/:channelId/messages', messageController.getChannelMessages);

// Post a message to a workspace channel (non-socket)
router.post('/workspaces/:workspaceName/channels/:channelId/messages', messageController.postChannelMessage);

// Get summary for a workspace channel using AI summarizer
router.get('/workspaces/:workspaceName/channels/:channelId/summary', messageController.getChannelSummary);

// Get direct messages between two users (DM)
router.get('/messages/:userEmail', messageController.getDirectMessages);

module.exports = router;