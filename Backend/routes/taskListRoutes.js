const express = require('express');
const router = express.Router();
const taskListController = require('../controllers/taskListController');

// Get tasklist by ID
router.get('/tasklist/:taskListId', taskListController.getTaskListById);

// Get all tasklists for user
router.get('/tasklists', taskListController.getTaskLists);

// Create a new tasklist
router.post('/tasklists', taskListController.createTaskList);

module.exports = router;