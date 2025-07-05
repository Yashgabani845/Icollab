const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');
const upload = require('../middleware/upload');

// Get a specific task with all details
router.get('/tasks/:taskId', taskController.getTaskById);

// Get tasks by tasklist and user
router.get('/tasks', taskController.getTasks);

// Create a new task
router.post('/tasks', taskController.createTask);

// Update task description
router.put('/tasks/:taskId/description', taskController.updateDescription);

// Add a checklist item
router.post('/tasks/:taskId/checklist', taskController.addChecklistItem);

// Update checklist item
router.put('/tasks/:taskId/checklist/:itemId', taskController.updateChecklistItem);

// Delete checklist item
router.delete('/tasks/:taskId/checklist/:itemId', taskController.deleteChecklistItem);

// Add a label
router.post('/tasks/:taskId/labels', taskController.addLabel);

// Remove a label
router.delete('/tasks/:taskId/labels/:label', taskController.removeLabel);

// Update deadline
router.put('/tasks/:taskId/deadline', taskController.updateDeadline);

// Add a comment
router.post('/tasks/:taskId/comments', taskController.addComment);

// Delete a comment
router.delete('/tasks/:taskId/comments/:commentId', taskController.deleteComment);

// Upload task attachment
router.post('/tasks/:taskId/attachments', upload.single('attachment'), taskController.uploadAttachment);

// Delete task attachment
router.delete('/tasks/:taskId/attachments', taskController.deleteAttachment);

// Upload cover photo
router.post('/tasks/:taskId/cover', upload.single('cover'), taskController.uploadCoverPhoto);

// Update cover (color/url)
router.put('/tasks/:taskId/cover', taskController.updateCoverPhoto);

// Move task to another list
router.put('/tasks/:taskId/move', taskController.moveTask);

// Delete/archive task
router.delete('/tasks/:taskId', taskController.deleteTask);

// Add/remove members to/from task
router.put('/tasks/:taskId/members', taskController.updateTaskMembers);

// Get all available users for assignment
router.get('/users/available', taskController.getAvailableUsers);

module.exports = router;