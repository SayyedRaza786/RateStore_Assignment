const express = require('express');
const { login, register, updatePassword } = require('../controllers/authController');
const { authenticateToken } = require('../middleware/auth');
const { validateLogin, validateUserRegistration, validatePasswordUpdate } = require('../middleware/validation');

const router = express.Router();

// Public routes
router.post('/login', validateLogin, login);
router.post('/register', validateUserRegistration, register);

// Protected routes
router.put('/update-password', authenticateToken, validatePasswordUpdate, updatePassword);

module.exports = router;
