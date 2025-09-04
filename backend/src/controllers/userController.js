const { promisePool } = require('../config/database');

const getStores = async (req, res) => {
  try {
    const { name, address, searchTerm, sortBy = 'name', sortOrder = 'ASC' } = req.query;
    const userId = req.user.id;
    
    let query = `
      SELECT s.*, 
             COALESCE(AVG(r.rating), 0) as average_rating,
             COUNT(r.id) as total_ratings,
             ur.rating as user_rating
      FROM stores s 
      LEFT JOIN ratings r ON s.id = r.store_id
      LEFT JOIN ratings ur ON s.id = ur.store_id AND ur.user_id = ?
    `;
    const params = [userId];
    const conditions = [];

    // Handle different search scenarios
    if (searchTerm) {
      // If searchTerm is provided, search in both name and address with OR
      conditions.push('(s.name LIKE ? OR s.address LIKE ?)');
      params.push(`%${searchTerm}%`, `%${searchTerm}%`);
    } else {
      // Handle individual field searches
      if (name) {
        conditions.push('s.name LIKE ?');
        params.push(`%${name}%`);
      }
      if (address) {
        conditions.push('s.address LIKE ?');
        params.push(`%${address}%`);
      }
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' GROUP BY s.id, ur.rating';

    // Add sorting
    const allowedSortFields = ['name', 'address', 'average_rating'];
    const sortField = allowedSortFields.includes(sortBy) ? (sortBy === 'name' ? 's.name' : sortBy) : 's.name';
    const order = sortOrder.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';
    query += ` ORDER BY ${sortField} ${order}`;

    const [stores] = await promisePool.execute(query, params);

    res.json({ stores });
  } catch (error) {
    console.error('Get stores error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const submitRating = async (req, res) => {
  try {
    const { storeId, rating } = req.body;
    const userId = req.user.id;

    // Check if store exists
    const [stores] = await promisePool.execute(
      'SELECT id FROM stores WHERE id = ?',
      [storeId]
    );

    if (stores.length === 0) {
      return res.status(404).json({ message: 'Store not found' });
    }

    // Check if user already rated this store
    const [existingRating] = await promisePool.execute(
      'SELECT id FROM ratings WHERE user_id = ? AND store_id = ?',
      [userId, storeId]
    );

    if (existingRating.length > 0) {
      // Update existing rating
      await promisePool.execute(
        'UPDATE ratings SET rating = ? WHERE user_id = ? AND store_id = ?',
        [rating, userId, storeId]
      );

      res.json({ message: 'Rating updated successfully' });
    } else {
      // Create new rating
      await promisePool.execute(
        'INSERT INTO ratings (user_id, store_id, rating) VALUES (?, ?, ?)',
        [userId, storeId, rating]
      );

      res.status(201).json({ message: 'Rating submitted successfully' });
    }
  } catch (error) {
    console.error('Submit rating error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = {
  getStores,
  submitRating
};
