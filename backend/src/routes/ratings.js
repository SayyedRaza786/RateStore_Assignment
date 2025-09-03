const express = require('express');
const router = express.Router();
const { promisePool } = require('../config/database');
const { authenticateToken, authorizeRole } = require('../middleware/auth');

// Get all ratings (admin only)
router.get('/', authenticateToken, authorizeRole('admin'), async (req, res) => {
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

// Get user's rating statistics
router.get('/user/stats', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const [stats] = await promisePool.execute(`
      SELECT 
        COUNT(*) as totalRatings,
        AVG(rating) as averageRating,
        COUNT(CASE WHEN comment IS NOT NULL AND comment <> '' THEN 1 END) as commentedRatings
      FROM ratings 
      WHERE user_id = ?
    `, [userId]);

    const [favoriteStore] = await promisePool.execute(`
      SELECT s.id, s.name, COUNT(*) as rating_count, CAST(AVG(r.rating) AS DECIMAL(4,2)) as avgRating
      FROM ratings r
      JOIN stores s ON r.store_id = s.id
      WHERE r.user_id = ?
      GROUP BY s.id, s.name
      ORDER BY rating_count DESC
      LIMIT 1
    `, [userId]);

    const [recent] = await promisePool.execute(`
      SELECT r.id, r.store_id, s.name AS storeName, r.rating, r.comment, r.created_at
      FROM ratings r
      JOIN stores s ON r.store_id = s.id
      WHERE r.user_id = ?
      ORDER BY r.created_at DESC
      LIMIT 5
    `, [userId]);

    res.json({
      ...stats[0],
      favoriteStore: favoriteStore[0] ? {
        id: favoriteStore[0].id,
        name: favoriteStore[0].name,
        count: favoriteStore[0].rating_count,
        average: favoriteStore[0].avgRating
      } : null,
      recentRatings: recent
    });
  } catch (error) {
    console.error('Error fetching user stats:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get ratings for a specific store
router.get('/store/:storeId', async (req, res) => {
  try {
    const [ratings] = await promisePool.execute(`
      SELECT 
        r.*,
        u.name as userName
      FROM ratings r
      JOIN users u ON r.user_id = u.id
      WHERE r.store_id = ?
      ORDER BY r.created_at DESC
    `, [req.params.storeId]);
    
    res.json(ratings);
  } catch (error) {
    console.error('Error fetching store ratings:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Create a new rating
router.post('/', authenticateToken, async (req, res) => {
  const { storeId, rating, comment } = req.body;
  console.log('[RATING][CREATE] incoming', { userId: req.user?.id, storeId, rating, hasComment: !!comment });

  if (!storeId || !rating) {
    return res.status(400).json({ message: 'Store ID and rating are required' });
  }

  if (rating < 1 || rating > 5) {
    return res.status(400).json({ message: 'Rating must be between 1 and 5' });
  }

  try {
    // Check if store exists
    const [stores] = await promisePool.execute('SELECT id FROM stores WHERE id = ?', [storeId]);
    if (stores.length === 0) {
      console.warn('[RATING][CREATE] store not found', { storeId });
      return res.status(404).json({ message: 'Store not found' });
    }

    // Check if user has already rated this store
    const [existingRating] = await promisePool.execute(
      'SELECT id FROM ratings WHERE user_id = ? AND store_id = ?',
      [req.user.id, storeId]
    );

    if (existingRating.length > 0) {
      // Update existing rating
  await promisePool.execute(
        'UPDATE ratings SET rating = ?, comment = ?, updated_at = NOW() WHERE user_id = ? AND store_id = ?',
        [rating, comment || null, req.user.id, storeId]
      );

      const [updatedRating] = await promisePool.execute(
        'SELECT * FROM ratings WHERE user_id = ? AND store_id = ?',
        [req.user.id, storeId]
      );

      res.json(updatedRating[0]);
    } else {
      // Create new rating
  const [result] = await promisePool.execute(
        'INSERT INTO ratings (user_id, store_id, rating, comment) VALUES (?, ?, ?, ?)',
        [req.user.id, storeId, rating, comment || null]
      );
  console.log('[RATING][CREATE] inserted id', result.insertId);

      const [newRating] = await promisePool.execute(
        'SELECT * FROM ratings WHERE id = ?',
        [result.insertId]
      );

      res.status(201).json(newRating[0]);
    }
  } catch (error) {
    console.error('Error creating/updating rating FULL:', error);
    if (error.code === 'ER_DUP_ENTRY') {
      res.status(400).json({ message: 'You have already rated this store' });
    } else {
      res.status(500).json({ message: 'Internal server error' });
    }
  }
});

// Update a rating
router.put('/:id', authenticateToken, async (req, res) => {
  const { rating, comment } = req.body;

  if (!rating) {
    return res.status(400).json({ message: 'Rating is required' });
  }

  if (rating < 1 || rating > 5) {
    return res.status(400).json({ message: 'Rating must be between 1 and 5' });
  }

  try {
    // Check if rating exists and belongs to user (unless admin)
    const [ratings] = await promisePool.execute(
      'SELECT * FROM ratings WHERE id = ?',
      [req.params.id]
    );

    if (ratings.length === 0) {
      return res.status(404).json({ message: 'Rating not found' });
    }

    if (req.user.role !== 'admin' && ratings[0].user_id !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    await promisePool.execute(
      'UPDATE ratings SET rating = ?, comment = ?, updated_at = NOW() WHERE id = ?',
      [rating, comment || null, req.params.id]
    );

    const [updatedRating] = await promisePool.execute(
      'SELECT * FROM ratings WHERE id = ?',
      [req.params.id]
    );

    res.json(updatedRating[0]);
  } catch (error) {
    console.error('Error updating rating:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Delete a rating
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    // Check if rating exists and belongs to user (unless admin)
    const [ratings] = await promisePool.execute(
      'SELECT * FROM ratings WHERE id = ?',
      [req.params.id]
    );

    if (ratings.length === 0) {
      return res.status(404).json({ message: 'Rating not found' });
    }

    if (req.user.role !== 'admin' && ratings[0].user_id !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const [result] = await promisePool.execute('DELETE FROM ratings WHERE id = ?', [req.params.id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Rating not found' });
    }

    res.json({ message: 'Rating deleted successfully' });
  } catch (error) {
    console.error('Error deleting rating:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;
