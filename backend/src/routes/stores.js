const express = require('express');
const router = express.Router();
const { promisePool } = require('../config/database');
const { authenticateToken, authorizeRole, authenticateTokenOptional } = require('../middleware/auth');

// Get all stores (with optional filters & user-specific rating/comment if logged in)
router.get('/', authenticateTokenOptional, async (req, res) => {
  try {
    const { name, address } = req.query;
    const conditions = [];
    const params = [];
    if (name) { conditions.push('s.name LIKE ?'); params.push(`%${name}%`); }
    if (address) { conditions.push('s.address LIKE ?'); params.push(`%${address}%`); }
    const whereClause = conditions.length ? 'WHERE ' + conditions.join(' AND ') : '';
    const userId = req.user?.id;
    let userFieldsSelect = ', NULL as userRating, NULL as userComment';
    if (userId) {
      userFieldsSelect = `, (SELECT rating FROM ratings ur WHERE ur.store_id = s.id AND ur.user_id = ? LIMIT 1) as userRating,
        (SELECT comment FROM ratings ur2 WHERE ur2.store_id = s.id AND ur2.user_id = ? LIMIT 1) as userComment`;
    }
    if (userId) { params.push(userId, userId); }
    const [stores] = await promisePool.execute(`
      SELECT 
        s.id, s.name, s.address, s.category, s.description, s.created_at, s.image_url,
        CAST(AVG(r.rating) AS DECIMAL(4,2)) as averageRating,
        COUNT(r.id) as totalRatings
        ${userFieldsSelect}
      FROM stores s
      LEFT JOIN ratings r ON s.id = r.store_id
      ${whereClause}
      GROUP BY s.id
      ORDER BY s.name
    `, params);
    res.json(stores);
  } catch (error) {
    console.error('Error fetching stores:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Quick search suggestions (lightweight) - returns id & name filtered by partial
router.get('/search/suggest', authenticateTokenOptional, async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || q.trim().length < 2) {
      return res.json([]); // require at least 2 chars
    }
    const term = `%${q.trim()}%`;
    const [rows] = await promisePool.execute(
      'SELECT id, name, category FROM stores WHERE name LIKE ? OR category LIKE ? ORDER BY name LIMIT 8',
      [term, term]
    );
    res.json(rows);
  } catch (e) {
    console.error('Error in suggestions:', e);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Top stores (by average rating & minimum rating count threshold)
router.get('/top', authenticateTokenOptional, async (req, res) => {
  try {
    const minCount = parseInt(req.query.minCount, 10) || 3;
    const limit = Math.min(parseInt(req.query.limit, 10) || 10, 50);
    const [rows] = await promisePool.execute(`
  SELECT s.id, s.name, s.category, s.address, s.description, s.image_url,
             CAST(AVG(r.rating) AS DECIMAL(4,2)) AS averageRating,
             COUNT(r.id) AS totalRatings
      FROM stores s
      JOIN ratings r ON s.id = r.store_id
      GROUP BY s.id
      HAVING totalRatings >= ?
      ORDER BY averageRating DESC, totalRatings DESC
      LIMIT ?
    `, [minCount, limit]);
    res.json(rows);
  } catch (e) {
    console.error('Error fetching top stores:', e);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get store owned by current user (for store owners) - MUST come before /:id route
router.get('/my-store', authenticateToken, async (req, res) => {
  try {
    // For now, we'll assume store owners can only own one store
    // In a real app, you might have a user_stores table linking users to stores they own
    const [stores] = await promisePool.execute(`
      SELECT 
        s.*, s.image_url,
  CAST(AVG(r.rating) AS DECIMAL(4,2)) as averageRating,
        COUNT(r.id) as totalRatings
      FROM stores s
      LEFT JOIN ratings r ON s.id = r.store_id
      WHERE s.owner_id = ?
      GROUP BY s.id
    `, [req.user.id]);
    
    if (stores.length === 0) {
      return res.status(404).json({ message: 'No store found for this user' });
    }
    
    res.json(stores[0]);
  } catch (error) {
    console.error('Error fetching user store:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get store by ID
router.get('/:id', async (req, res) => {
  try {
    const [stores] = await promisePool.execute(`
      SELECT 
        s.*, s.image_url,
  CAST(AVG(r.rating) AS DECIMAL(4,2)) as averageRating,
        COUNT(r.id) as totalRatings
      FROM stores s
      LEFT JOIN ratings r ON s.id = r.store_id
      WHERE s.id = ?
      GROUP BY s.id
    `, [req.params.id]);
    
    if (stores.length === 0) {
      return res.status(404).json({ message: 'Store not found' });
    }
    
    res.json(stores[0]);
  } catch (error) {
    console.error('Error fetching store:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get store stats (for store owners)
router.get('/:id/stats', authenticateToken, async (req, res) => {
  try {
    const [ratings] = await promisePool.execute(`
      SELECT 
        r.*,
        u.name as userName
      FROM ratings r
      JOIN users u ON r.user_id = u.id
      WHERE r.store_id = ?
      ORDER BY r.created_at DESC
      LIMIT 10
    `, [req.params.id]);

    const [stats] = await promisePool.execute(`
      SELECT 
        COUNT(*) as totalRatings,
        AVG(rating) as averageRating,
        COUNT(DISTINCT user_id) as uniqueCustomers,
        COUNT(CASE WHEN created_at >= DATE_SUB(NOW(), INTERVAL 1 MONTH) THEN 1 END) as monthlyRatings
      FROM ratings 
      WHERE store_id = ?
    `, [req.params.id]);

    res.json({
      ...stats[0],
      recentRatings: ratings
    });
  } catch (error) {
    console.error('Error fetching store stats:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Create store (admin only)
router.post('/', authenticateToken, authorizeRole('admin'), async (req, res) => {
  const { name, address, category, description } = req.body;

  if (!name || !address || !category) {
    return res.status(400).json({ message: 'Name, address, and category are required' });
  }

  try {
    const [result] = await promisePool.execute(
      'INSERT INTO stores (name, address, category, description) VALUES (?, ?, ?, ?)',
      [name, address, category, description || null]
    );

    const [newStore] = await promisePool.execute(
      'SELECT * FROM stores WHERE id = ?',
      [result.insertId]
    );

    res.status(201).json(newStore[0]);
  } catch (error) {
    console.error('Error creating store:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Update store (admin only)
router.put('/:id', authenticateToken, authorizeRole('admin'), async (req, res) => {
  const { name, address, category, description } = req.body;

  if (!name || !address || !category) {
    return res.status(400).json({ message: 'Name, address, and category are required' });
  }

  try {
    await promisePool.execute(
      'UPDATE stores SET name = ?, address = ?, category = ?, description = ? WHERE id = ?',
      [name, address, category, description || null, req.params.id]
    );

    const [updatedStore] = await promisePool.execute(
      'SELECT * FROM stores WHERE id = ?',
      [req.params.id]
    );

    if (updatedStore.length === 0) {
      return res.status(404).json({ message: 'Store not found' });
    }

    res.json(updatedStore[0]);
  } catch (error) {
    console.error('Error updating store:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Delete store (admin only)
router.delete('/:id', authenticateToken, authorizeRole('admin'), async (req, res) => {
  try {
    // First delete all ratings for this store
    await promisePool.execute('DELETE FROM ratings WHERE store_id = ?', [req.params.id]);
    
    // Then delete the store
    const [result] = await promisePool.execute('DELETE FROM stores WHERE id = ?', [req.params.id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Store not found' });
    }

    res.json({ message: 'Store deleted successfully' });
  } catch (error) {
    console.error('Error deleting store:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;
