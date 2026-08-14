const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
const userAuth = require('../middleware/userAuth');

const JWT_SECRET = process.env.JWT_SECRET || 'sdc_canteen_jwt_secret_key_1998';

// 1. Customer Registration
router.post('/register', async (req, res) => {
  const { username, email, password, full_name, phone, address, city, state, pincode } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ success: false, message: 'Username, email and password are required.' });
  }

  try {
    // Check if username or email already exists
    const [existing] = await db.query(
      'SELECT id FROM users WHERE username = ? OR email = ?',
      [username, email]
    );

    if (existing.length > 0) {
      return res.status(400).json({ success: false, message: 'Username or email already registered.' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert user
    const [result] = await db.query(
      'INSERT INTO users (username, email, password, full_name, phone, address, city, state, pincode) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [username, email, hashedPassword, full_name || null, phone || null, address || null, city || null, state || null, pincode || null]
    );

    res.status(217).json({
      success: true,
      message: 'Registration successful! You can now log in.',
      userId: result.insertId
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ success: false, message: 'Server error during registration.' });
  }
});

// 2. Customer Login
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ success: false, message: 'Username and password are required.' });
  }

  try {
    const [users] = await db.query(
      'SELECT * FROM users WHERE username = ? OR email = ?',
      [username, username]
    );

    if (users.length === 0) {
      return res.status(401).json({ success: false, message: 'Invalid username or password.' });
    }

    const user = users[0];
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid username or password.' });
    }

    // Generate JWT (with role customer)
    const token = jwt.sign(
      { id: user.id, username: user.username, role: 'customer' },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        full_name: user.full_name,
        phone: user.phone,
        address: user.address,
        city: user.city,
        state: user.state,
        pincode: user.pincode
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Server error during login.' });
  }
});

// 3. Get User Profile
router.get('/profile', userAuth, async (req, res) => {
  try {
    const [users] = await db.query(
      'SELECT id, username, email, full_name, phone, address, city, state, pincode, created_at FROM users WHERE id = ?',
      [req.user.id]
    );

    if (users.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    res.status(200).json({ success: true, data: users[0] });
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({ success: false, message: 'Server error fetching profile.' });
  }
});

// 4. Update User Profile
router.put('/profile', userAuth, async (req, res) => {
  const { full_name, phone, address, city, state, pincode } = req.body;

  try {
    await db.query(
      'UPDATE users SET full_name = ?, phone = ?, address = ?, city = ?, state = ?, pincode = ? WHERE id = ?',
      [full_name || null, phone || null, address || null, city || null, state || null, pincode || null, req.user.id]
    );

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully.',
      data: { full_name, phone, address, city, state, pincode }
    });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ success: false, message: 'Server error updating profile.' });
  }
});

module.exports = router;
