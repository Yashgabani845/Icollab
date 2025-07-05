const express = require('express');
const router = express.Router();
const projectController = require('../controllers/projectController');

// Add project to workspace
router.post('/projects', projectController.addProject);

// Get all projects for a workspace
router.get('/workspaces/:workspaceId/projects', projectController.getWorkspaceProjects);

// Assign PR or issue to a user
router.patch('/projects/:projectId/:type/:itemId/assign', projectController.assignProjectItem);

module.exports = router;