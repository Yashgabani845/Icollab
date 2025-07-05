const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// Get current user (by token)
router.get('/current-user', userController.getCurrentUser);

// Get all users
router.get('/users', userController.getAllUsers);

// Get user by ID
router.get('/users/:id', userController.getUserById);

// Get profile (user details + workspaces)
router.get('/profile', userController.getProfile);

module.exports = router;