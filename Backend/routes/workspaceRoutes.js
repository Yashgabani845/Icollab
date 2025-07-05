const express = require('express');
const router = express.Router();
const workspaceController = require('../controllers/workspaceController');

// Create workspace
router.post('/workspaces', workspaceController.createWorkspace);

// Get all workspaces for a user
router.get('/workspaces', workspaceController.getUserWorkspaces);

// Get workspace members
router.get('/workspaces/:workspaceName/members', workspaceController.getWorkspaceMembers);

// Get workspace by name
router.get('/workspaces/:workspaceName', workspaceController.getWorkspaceByName);

module.exports = router;