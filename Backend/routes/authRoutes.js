const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Local Auth
router.post('/signup', authController.signup);
router.post('/login', authController.login);

// Google Auth
router.post('/google-signup', authController.googleSignup);
router.post('/google-login', authController.googleLogin);

module.exports = router;