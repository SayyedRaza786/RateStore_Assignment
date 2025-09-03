const { promisePool } = require('../config/database');

// Lazy Cloudinary init (reuse pattern from adminController to avoid duplication)
let cloudinaryConfigured = false;
function ensureCloudinary() {
  if (cloudinaryConfigured) return require('cloudinary').v2;
  const { v2 } = require('cloudinary');
  v2.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true
  });
  cloudinaryConfigured = true;
  return v2;
}

// Get dashboard data: summary + (optionally) selected store ratings
const getDashboard = async (req, res) => {
  try {
    const userId = req.user.id;
    const { storeId } = req.query; // allow selecting a specific store if multiple in future

    // All stores owned by this user (support future multi-store scenario)
    const [ownedStores] = await promisePool.execute(
      'SELECT id, name, email, image_url, category, created_at FROM stores WHERE owner_id = ? ORDER BY created_at DESC',
      [userId]
    );

    if (ownedStores.length === 0) {
      return res.status(200).json({ noStore: true, stores: [], message: 'No store created yet' });
    }

    // Determine active store (either requested or first)
    const activeStore = storeId ? ownedStores.find(s => s.id === parseInt(storeId, 10)) : ownedStores[0];
    if (!activeStore) {
      return res.status(404).json({ message: 'Specified store not found for this owner' });
    }

    // Avg rating + ratings list for active store
    const [avgRating] = await promisePool.execute(
      'SELECT COALESCE(AVG(rating), 0) as average_rating, COUNT(*) as total_ratings FROM ratings WHERE store_id = ?',
      [activeStore.id]
    );

    const [ratingsData] = await promisePool.execute(`
      SELECT r.id, r.rating, r.comment, r.created_at, u.name, u.email
      FROM ratings r
      JOIN users u ON r.user_id = u.id
      WHERE r.store_id = ?
      ORDER BY r.created_at DESC
    `, [activeStore.id]);

    res.json({
      stores: ownedStores,
      store: {
        ...activeStore,
        average_rating: parseFloat(avgRating[0].average_rating).toFixed(2),
        total_ratings: avgRating[0].total_ratings
      },
      ratings: ratingsData
    });
  } catch (error) {
    console.error('Store owner dashboard error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Create a new store for this owner
const createStore = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, email, address, category, phone, website, description, imageBase64 } = req.body;

    // Prevent duplicate email
    const [existing] = await promisePool.execute('SELECT id FROM stores WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(400).json({ message: 'Store with this email already exists' });
    }

    let imageUrl = null;
    let imageUploadStatus = 'none';
    if (imageBase64 && imageBase64.startsWith('data:')) {
      if (imageBase64.length > 3_000_000) {
        return res.status(400).json({ message: 'Image too large (>~2MB base64)'});
      }
      try {
        const haveCreds = !!(process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET);
        if (haveCreds) {
          const cloudinary = ensureCloudinary();
            const uploadRes = await cloudinary.uploader.upload(imageBase64, {
              folder: 'store_rating/stores',
              transformation: [{ width: 600, height: 400, crop: 'limit' }]
            });
            imageUrl = uploadRes.secure_url;
            imageUploadStatus = 'cloudinary';
        } else {
          imageUrl = imageBase64.substring(0, 250000);
          imageUploadStatus = 'inline-fallback-no-creds';
        }
      } catch (e) {
        console.error('[owner.createStore] upload error', e.message);
        try {
          imageUrl = imageBase64.substring(0, 250000);
          imageUploadStatus = 'inline-fallback-error';
        } catch(err) {
          // swallow
        }
      }
    }

    const [result] = await promisePool.execute(
      'INSERT INTO stores (name, email, address, owner_id, category, phone, website, description, image_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [name, email, address || null, userId, category || null, phone || null, website || null, description || null, imageUrl]
    );

    const [created] = await promisePool.execute('SELECT * FROM stores WHERE id = ?', [result.insertId]);
    res.status(201).json({ message: 'Store created', store: created[0], imageUploadStatus });
  } catch (error) {
    console.error('Owner create store error:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

// List stores owned by this user (lightweight)
const listStores = async (req, res) => {
  try {
    const userId = req.user.id;
    const [rows] = await promisePool.execute('SELECT id, name, email, image_url, category, created_at FROM stores WHERE owner_id = ? ORDER BY created_at DESC', [userId]);
    res.json({ stores: rows });
  } catch (error) {
    console.error('Owner list stores error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = {
  getDashboard,
  createStore,
  listStores
};
