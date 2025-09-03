const express = require('express');
const {
  getDashboardStats,
  createUser,
  createStore,
  getUsers,
  getStores,
  getUserDetails,
  testCloudinary
} = require('../controllers/adminController');
const { authenticateToken, authorizeRole } = require('../middleware/auth');
const { validateUserRegistration, validateStore } = require('../middleware/validation');
const { promisePool } = require('../config/database');

const router = express.Router();

// All admin routes require authentication and admin role
router.use(authenticateToken);
router.use(authorizeRole('admin'));

// Dashboard stats
router.get('/stats', getDashboardStats);

// User management
router.post('/users', validateUserRegistration, createUser);
router.get('/users', async (req, res) => {
  try {
    const { name, email, address, role } = req.query;
    const conditions = [];
    const params = [];
    if (name) { conditions.push('u.name LIKE ?'); params.push(`%${name}%`); }
    if (email) { conditions.push('u.email LIKE ?'); params.push(`%${email}%`); }
    if (address) { conditions.push('u.address LIKE ?'); params.push(`%${address}%`); }
    if (role) { conditions.push('u.role = ?'); params.push(role); }
    const whereClause = conditions.length ? 'WHERE ' + conditions.join(' AND ') : '';
    const [users] = await promisePool.execute(`
      SELECT 
        u.id, u.name, u.email, u.address, u.role, u.created_at, u.updated_at,
        -- Count of ratings the user has personally submitted
        COUNT(DISTINCT r.id) as ratingsCount,
        -- Average rating of stores owned by this user (only meaningful for store_owner)
        (
          SELECT COALESCE(AVG(r2.rating), 0)
          FROM stores s2
          LEFT JOIN ratings r2 ON s2.id = r2.store_id
          WHERE s2.owner_id = u.id
        ) AS store_rating
      FROM users u
      LEFT JOIN ratings r ON u.id = r.user_id
      ${whereClause}
      GROUP BY u.id
      ORDER BY u.created_at DESC
    `, params);
    res.json({ users });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});
router.get('/users/:id', getUserDetails);

// Store management
// Store creation now supports optional category & imageBase64 (data URL) posted in JSON
router.post('/stores', validateStore, createStore);
router.get('/stores', getStores);

// Diagnostics
router.get('/cloudinary-test', testCloudinary);

// Rating management
router.get('/ratings', async (req, res) => {
  try {
    const [ratings] = await promisePool.execute(`
      SELECT 
        r.*,
        u.name as userName,
        s.name as storeName
      FROM ratings r
      JOIN users u ON r.user_id = u.id
      JOIN stores s ON r.store_id = s.id
      ORDER BY r.created_at DESC
    `);
    res.json(ratings);
  } catch (error) {
    console.error('Error fetching ratings:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;
