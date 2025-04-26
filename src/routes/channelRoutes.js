const express = require('express');
const router = express.Router();
const { summarizeChat } = require('../controllers/channelController');

router.get('/:workspaceName/channels/:channelId/summary', summarizeChat);

module.exports = router;
