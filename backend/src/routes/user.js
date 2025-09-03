const express = require('express');
const { getStores, submitRating } = require('../controllers/userController');
const { authenticateToken, authorizeRole } = require('../middleware/auth');
const { validateRating } = require('../middleware/validation');

const router = express.Router();

// All user routes require authentication and user role
router.use(authenticateToken);
router.use(authorizeRole('user'));

// Store browsing
router.get('/stores', getStores);

// Rating submission
router.post('/ratings', validateRating, submitRating);

module.exports = router;
