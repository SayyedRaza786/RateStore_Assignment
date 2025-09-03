const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { promisePool } = require('../config/database');

const login = async (req, res) => {
  try {
  const { email, password, role: expectedRole } = req.body;
    console.log('[LOGIN] Attempt start', { email });

    // Check if user exists
    let users;
    try {
      [users] = await promisePool.execute(
  'SELECT id, name, email, password, address, role, created_at, updated_at FROM users WHERE email = ? LIMIT 1',
        [email]
      );
    } catch (dbErr) {
      console.error('[LOGIN] Query error', dbErr.message);
      return res.status(500).json({ message: 'Internal server error' });
    }

  if (users.length === 0) {
      console.log('[LOGIN] No user found for email');
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const user = users[0];
    try {
      console.log('[LOGIN] User row raw:', user);
      console.log('[LOGIN] User row keys:', Object.keys(user));
      console.log('[LOGIN] User row found', { id: user.id, role: user.role });
    } catch (e) {
      console.log('[LOGIN] Unable to log raw user row', e.message);
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      console.log('[LOGIN] Password mismatch for user', user.id);
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // If an expected role was provided (portal-specific login), enforce match before token issuance
    if (expectedRole && expectedRole !== user.role) {
      // Provide helpful guidance
      let guidance = `This account is registered as '${user.role}'. Please select the '${user.role}' login option.`;
      if (expectedRole === 'store_owner' && user.role === 'user') {
        guidance = `This email belongs to a regular user account. Sign up / switch to 'User' login to access the user dashboard. To become a store owner, create a store (admin) or request role upgrade.`;
      } else if (expectedRole === 'admin') {
        guidance = `Admin portal access denied. This account role is '${user.role}'. Use the matching login option.`;
      }
      return res.status(403).json({
        message: 'Role mismatch for selected login mode',
        detail: guidance,
        code: 'ROLE_PORTAL_MISMATCH'
      });
    }

    // Generate JWT token
    if (!process.env.JWT_SECRET) {
      console.warn('[LOGIN] Missing JWT_SECRET in environment');
    }
    try {
      var token = jwt.sign(
        { userId: user.id, role: user.role },
        process.env.JWT_SECRET || 'dev_fallback_secret_do_not_use_in_prod',
        { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
      );
    } catch (e) {
      console.error('[LOGIN] JWT sign error', e.message);
      return res.status(500).json({ message: 'Token generation failed' });
    }

    // Ensure id present (fallback query if somehow missing)
    if (!user.id) {
      try {
        const [idRows] = await promisePool.execute('SELECT id FROM users WHERE email = ? LIMIT 1', [email]);
        if (idRows.length) user.id = idRows[0].id;
      } catch (e) {
        console.warn('[LOGIN] Fallback id query failed', e.message);
      }
    }

    // Remove password & normalize fields for frontend consistency
    const { password: _, ...userWithoutPassword } = user;
    const normalizedUser = {
      id: userWithoutPassword.id,
      name: userWithoutPassword.name,
      email: userWithoutPassword.email,
      address: userWithoutPassword.address,
      role: userWithoutPassword.role,
      createdAt: userWithoutPassword.created_at,
      updatedAt: userWithoutPassword.updated_at
    };

    res.json({
      message: 'Login successful',
      token,
      user: normalizedUser
    });
    console.log('[LOGIN] Success for user', user.id);
  } catch (error) {
  console.error('Login error full:', error);
  res.status(500).json({ message: 'Internal server error', detail: error.message, stack: error.stack });
  }
};

const register = async (req, res) => {
  const { name, email, password, address, role } = req.body;
  console.log('[REGISTER] Start', { email });
  try {
    const [exists] = await promisePool.execute('SELECT id FROM users WHERE email = ? LIMIT 1', [email]);
    if (exists.length) {
      console.log('[REGISTER] Email exists');
      return res.status(400).json({ message: 'User with this email already exists' });
    }
    const hash = await bcrypt.hash(password, 10);
    // Only allow specific roles during open registration
    const allowedRoles = ['user', 'store_owner', 'admin'];
    let finalRole = 'user';
    if (role && allowedRoles.includes(role)) {
      finalRole = role; // NOTE: In production you might restrict 'admin' creation.
    }
    const [insertResult] = await promisePool.execute(
      'INSERT INTO users (name, email, password, address, role) VALUES (?, ?, ?, ?, ?)',
      [name, email, hash, address, finalRole]
    );
    const newId = insertResult.insertId;
    const [rows] = await promisePool.execute(
      'SELECT id, name, email, address, role, created_at, updated_at FROM users WHERE id = ? LIMIT 1',
      [newId]
    );
    const user = rows[0];
    user.role = (user.role || '').toLowerCase();
    res.status(201).json({ message: 'User registered successfully', user });
    console.log('[REGISTER] Success id', newId);
  } catch (err) {
  console.error('[REGISTER] Fatal full', err);
  return res.status(500).json({ message: 'Internal server error', detail: err.message, stack: err.stack });
  }
};

const updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    // Get current user
    const [users] = await promisePool.execute(
      'SELECT password FROM users WHERE id = ?',
      [userId]
    );

    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Verify current password
    const isValidPassword = await bcrypt.compare(currentPassword, users[0].password);
    if (!isValidPassword) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    // Hash new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await promisePool.execute(
      'UPDATE users SET password = ? WHERE id = ?',
      [hashedNewPassword, userId]
    );

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Password update error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = { login, register, updatePassword };
