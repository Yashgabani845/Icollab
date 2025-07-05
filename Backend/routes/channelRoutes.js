const express = require('express');
const router = express.Router();
const channelController = require('../controllers/channelController');

// Create a new channel in a workspace (embedded channel)
router.post('/workspaces/:workspaceName/channels', channelController.createChannel);

// Get all channels for a workspace (by workspaceName)
router.get('/channels/:workspaceName', channelController.getChannelsByWorkspaceName);

// (Optional) Create channel as separate model (if used)
router.post('/channels', channelController.createChannelModel);

module.exports = router;