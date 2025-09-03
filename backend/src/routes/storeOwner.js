const express = require('express');
const { getDashboard, createStore, listStores } = require('../controllers/storeOwnerController');
const { authenticateToken, authorizeRole } = require('../middleware/auth');

const router = express.Router();

// All store owner routes require authentication and store_owner role
router.use(authenticateToken);
router.use(authorizeRole('store_owner'));

// Dashboard (supports optional ?storeId=)
router.get('/dashboard', getDashboard);

// Create a new store (owner self-service)
router.post('/stores', createStore);

// List all stores owned by this user
router.get('/stores', listStores);

module.exports = router;
