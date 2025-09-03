const bcrypt = require('bcryptjs');
const { promisePool } = require('../config/database');

const getDashboardStats = async (req, res) => {
  try {
    // Get total users count
    const [userCount] = await promisePool.execute(
      'SELECT COUNT(*) as count FROM users WHERE role != "admin"'
    );

    // Get total stores count
    const [storeCount] = await promisePool.execute(
      'SELECT COUNT(*) as count FROM stores'
    );

    // Get total ratings count and average rating
    const [ratingStats] = await promisePool.execute(
      'SELECT COUNT(*) as count, AVG(rating) as average FROM ratings'
    );

    res.json({
      totalUsers: userCount[0].count,
      totalStores: storeCount[0].count,
      totalRatings: ratingStats[0].count,
      averageRating: ratingStats[0].average || 0
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const createUser = async (req, res) => {
  try {
    const { name, email, password, address, role = 'user' } = req.body;

    // Check if user already exists
    const [existingUsers] = await promisePool.execute(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );

    if (existingUsers.length > 0) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const [result] = await promisePool.execute(
      'INSERT INTO users (name, email, password, address, role) VALUES (?, ?, ?, ?, ?)',
      [name, email, hashedPassword, address, role]
    );

    // Get created user
    const [newUser] = await promisePool.execute(
      'SELECT id, name, email, address, role, created_at FROM users WHERE id = ?',
      [result.insertId]
    );

    res.status(201).json({
      message: 'User created successfully',
      user: newUser[0]
    });
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Cloudinary (lazy init to avoid requiring config when not used)
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

const createStore = async (req, res) => {
  try {
    const { name, email, address, ownerEmail, category, imageBase64 } = req.body;
    console.log('[createStore] incoming payload', { name, email, address, ownerEmail, category, hasImage: !!imageBase64 });

    // If ownerEmail omitted but admin wants same as store email, allow implicit assignment
    const effectiveOwnerEmail = ownerEmail?.trim() || '';

    let ownerId = null;
    
    // If owner email is provided, find the owner
    if (effectiveOwnerEmail) {
      const [matches] = await promisePool.execute('SELECT id, role FROM users WHERE email = ?', [effectiveOwnerEmail]);
      console.log('[createStore] owner matches length', matches.length);
      if (matches.length === 0) {
        // Auto-create new store owner user (temporary password)
        try {
          const tempPassword = generateTempPassword();
          const hashed = await bcrypt.hash(tempPassword, 10);
          const [ins] = await promisePool.execute(
            'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
            [name.substring(0, 40) + ' Owner', effectiveOwnerEmail, hashed, 'store_owner']
          );
          ownerId = ins.insertId;
          // Optionally return temp password so admin can share it
          req.tempOwnerPassword = tempPassword;
          console.log('[createStore] auto-created owner user id', ownerId);
        } catch (e) {
          console.error('Auto-create owner failed:', e);
          return res.status(400).json({ message: 'Failed to auto-create store owner user' });
        }
      } else {
        ownerId = matches[0].id;
        if (matches[0].role !== 'store_owner') {
          try {
            await promisePool.execute('UPDATE users SET role = "store_owner" WHERE id = ?', [ownerId]);
          } catch (e) {
            console.warn('Failed to promote user to store_owner:', e.message);
          }
        }
      }
    }

    // Check if store email already exists
    const [existingStores] = await promisePool.execute('SELECT id FROM stores WHERE email = ?', [email]);
    if (existingStores.length > 0) {
      return res.status(400).json({ message: 'Store with this email already exists (duplicate email)' });
    }

    let imageUrl = null;
    // If image provided as base64 data URL, attempt upload
    let imageUploadStatus = 'none';
    if (imageBase64 && imageBase64.startsWith('data:')) {
      console.log('[createStore] image length', imageBase64.length);
      // Simple guard against extremely large inline images (roughly > ~2.5MB base64 string)
      if (imageBase64.length > 3_000_000) {
        return res.status(400).json({
          message: 'Image too large. Please upload an image under ~2MB.',
          providedLength: imageBase64.length
        });
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
          console.log('[createStore] cloudinary uploaded URL', imageUrl);
        } else {
          imageUrl = imageBase64.substring(0, 250000); // shrink stored size
          imageUploadStatus = 'inline-fallback-no-creds';
          console.log('[createStore] no cloudinary creds, stored inline');
        }
      } catch (e) {
        console.error('[createStore] upload error', e);
        try {
          imageUrl = imageBase64.substring(0, 250000);
          imageUploadStatus = 'inline-fallback-error';
        } catch(storeErr) {
          console.error('[createStore] inline fallback failed', storeErr);
        }
      }
    }

    // Create store (include category & image_url if columns exist)
    const [result] = await promisePool.execute(
      'INSERT INTO stores (name, email, address, owner_id, category, image_url) VALUES (?, ?, ?, ?, ?, ?)',
      [name, email, address, ownerId, category || null, imageUrl]
    );

    // Get created store with owner info
    const [newStore] = await promisePool.execute(`
      SELECT s.*, u.name as owner_name, u.email as owner_email 
      FROM stores s 
      LEFT JOIN users u ON s.owner_id = u.id 
      WHERE s.id = ?
    `, [result.insertId]);

    res.status(201).json({
      message: 'Store created successfully',
      store: newStore[0],
      ownerTempPassword: req.tempOwnerPassword || undefined,
      imageUploadStatus
    });
  console.log('[createStore] success store id', newStore[0]?.id);
  } catch (error) {
    console.error('Create store error:', error);
    res.status(500).json({ 
      message: 'Internal server error',
      error: error.message,
      hint: 'Check server logs for [createStore] lines and Cloudinary credentials'
    });
  }
};

// Diagnostic endpoint to verify Cloudinary configuration & basic upload works
const testCloudinary = async (req, res) => {
  try {
    const haveCreds = !!(process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET);
    if (!haveCreds) {
      return res.status(400).json({
        ok: false,
        message: 'Cloudinary credentials missing in environment',
        vars: {
          CLOUDINARY_CLOUD_NAME: !!process.env.CLOUDINARY_CLOUD_NAME,
          CLOUDINARY_API_KEY: !!process.env.CLOUDINARY_API_KEY,
          CLOUDINARY_API_SECRET: !!process.env.CLOUDINARY_API_SECRET
        }
      });
    }
    const cloudinary = ensureCloudinary();
    // 1x1 transparent PNG
    const tiny = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8Xw8AAn0B9pT9kXwAAAAASUVORK5CYII=';
    const start = Date.now();
    const uploadRes = await cloudinary.uploader.upload(tiny, { folder: 'store_rating/diagnostics' });
    const ms = Date.now() - start;
    return res.json({
      ok: true,
      tookMs: ms,
      secure_url: uploadRes.secure_url,
      bytes: uploadRes.bytes,
      format: uploadRes.format,
      resource_type: uploadRes.resource_type
    });
  } catch (error) {
    console.error('[testCloudinary] error', error);
    return res.status(500).json({ ok: false, message: 'Cloudinary test failed', error: error.message });
  }
};

// Helper to generate strong temporary password
function generateTempPassword() {
  const upper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lower = 'abcdefghijklmnopqrstuvwxyz';
  const nums = '0123456789';
  const special = '!@#$%^&*()_+=';
  const all = upper + lower + nums + special;
  const pick = (set) => set[Math.floor(Math.random() * set.length)];
  let pwd = pick(upper) + pick(lower) + pick(nums) + pick(special);
  for (let i = pwd.length; i < 10; i++) pwd += pick(all);
  return pwd.split('').sort(() => 0.5 - Math.random()).join('');
}

const getUsers = async (req, res) => {
  try {
    const { name, email, address, role, sortBy = 'name', sortOrder = 'ASC' } = req.query;
    
    let query = `
      SELECT id, name, email, address, role, created_at 
      FROM users 
      WHERE role != 'admin'
    `;
    const params = [];

    // Add filters
    if (name) {
      query += ' AND name LIKE ?';
      params.push(`%${name}%`);
    }
    if (email) {
      query += ' AND email LIKE ?';
      params.push(`%${email}%`);
    }
    if (address) {
      query += ' AND address LIKE ?';
      params.push(`%${address}%`);
    }
    if (role) {
      query += ' AND role = ?';
      params.push(role);
    }

    // Add sorting
    const allowedSortFields = ['name', 'email', 'role', 'created_at'];
    const sortField = allowedSortFields.includes(sortBy) ? sortBy : 'name';
    const order = sortOrder.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';
    query += ` ORDER BY ${sortField} ${order}`;

    const [users] = await promisePool.execute(query, params);

    res.json({ users });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const getStores = async (req, res) => {
  try {
    const { name, email, address, sortBy = 'name', sortOrder = 'ASC' } = req.query;
    
    let query = `
      SELECT s.*, 
             u.name as owner_name, 
             u.email as owner_email,
             COALESCE(AVG(r.rating), 0) as average_rating,
             COUNT(r.id) as total_ratings
      FROM stores s 
      LEFT JOIN users u ON s.owner_id = u.id 
      LEFT JOIN ratings r ON s.id = r.store_id
    `;
    const params = [];
    const conditions = [];

    // Add filters
    if (name) {
      conditions.push('s.name LIKE ?');
      params.push(`%${name}%`);
    }
    if (email) {
      conditions.push('s.email LIKE ?');
      params.push(`%${email}%`);
    }
    if (address) {
      conditions.push('s.address LIKE ?');
      params.push(`%${address}%`);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' GROUP BY s.id, u.name, u.email';

    // Add sorting
    const allowedSortFields = ['name', 'email', 'average_rating', 'created_at'];
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

const getUserDetails = async (req, res) => {
  try {
    const { id } = req.params;

    const [users] = await promisePool.execute(
      'SELECT id, name, email, address, role, created_at FROM users WHERE id = ?',
      [id]
    );

    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const user = users[0];

    // If user is a store owner, get their store rating
    if (user.role === 'store_owner') {
      const [storeRating] = await promisePool.execute(`
        SELECT COALESCE(AVG(r.rating), 0) as average_rating
        FROM stores s 
        LEFT JOIN ratings r ON s.id = r.store_id 
        WHERE s.owner_id = ?
      `, [id]);

      user.store_rating = storeRating[0]?.average_rating || 0;
    }

    res.json({ user });
  } catch (error) {
    console.error('Get user details error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = {
  getDashboardStats,
  createUser,
  createStore,
  getUsers,
  getStores,
  getUserDetails,
  testCloudinary
};
