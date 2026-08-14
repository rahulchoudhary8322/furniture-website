const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const firebaseAdmin = require('../config/firebaseAdmin');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET || 'sdc_canteen_jwt_secret_key_1998';

exports.login = async (req, res) => {
  const { username, password, firebaseToken } = req.body;

  try {
    if (firebaseToken && firebaseAdmin.isInitialized()) {
      const decodedToken = await firebaseAdmin.auth().verifyIdToken(firebaseToken);
      const email = decodedToken.email;

      const [rows] = await db.query('SELECT * FROM admin_users WHERE username = ?', [email]);
      const adminEmailEnv = process.env.ADMIN_USERNAME || 'admin';

      if (rows.length > 0 || email === adminEmailEnv || email.split('@')[0] === adminEmailEnv) {
        const adminUser = rows[0] || { id: 1, username: email };
        return res.status(200).json({
          success: true,
          message: 'Login successful',
          token: firebaseToken,
          admin: { id: adminUser.id, username: adminUser.username }
        });
      } else {
        return res.status(401).json({ success: false, message: 'Invalid admin credentials or role unauthorized.' });
      }
    }

    if (!username || !password) {
      return res.status(400).json({ success: false, message: 'Please provide username and password.' });
    }

    const [rows] = await db.query('SELECT * FROM admin_users WHERE username = ?', [username]);
    if (rows.length === 0) {
      return res.status(401).json({ success: false, message: 'Invalid credentials.' });
    }

    const admin = rows[0];
    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials.' });
    }

    const token = jwt.sign({ id: admin.id, username: admin.username, role: 'admin' }, JWT_SECRET, { expiresIn: '24h' });
    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      admin: { id: admin.id, username: admin.username }
    });
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({ success: false, message: 'Server error during admin login.' });
  }
};

exports.verifySession = async (req, res) => {
  res.status(200).json({ success: true, admin: req.admin });
};

// Fetch current contact details
exports.getContactDetails = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM contact_details LIMIT 1');
    res.status(200).json({ success: true, data: rows[0] || null });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update contact details
exports.updateContactDetails = async (req, res) => {
  const { phone, email, address, working_hours, whatsapp } = req.body;
  try {
    const [rows] = await db.query('SELECT id FROM contact_details LIMIT 1');
    if (rows.length === 0) {
      await db.query(
        'INSERT INTO contact_details (phone, email, address, working_hours, whatsapp) VALUES (?, ?, ?, ?, ?)',
        [phone, email, address, working_hours, whatsapp]
      );
    } else {
      await db.query(
        'UPDATE contact_details SET phone = ?, email = ?, address = ?, working_hours = ?, whatsapp = ? WHERE id = ?',
        [phone, email, address, working_hours, whatsapp, rows[0].id]
      );
    }
    res.status(200).json({ success: true, message: 'Contact details updated successfully.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Fetch all banners
exports.getBanners = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM banners');
    res.status(200).json({ success: true, data: rows });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Add banner
exports.addBanner = async (req, res) => {
  const { title, subtitle, link, is_active } = req.body;
  let image_url = '';
  if (req.file) {
    image_url = `/uploads/${req.file.filename}`;
  }
  try {
    await db.query(
      'INSERT INTO banners (title, subtitle, image_url, link, is_active) VALUES (?, ?, ?, ?, ?)',
      [title, subtitle, image_url, link, is_active === 'false' ? 0 : 1]
    );
    res.status(201).json({ success: true, message: 'Banner added successfully.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete banner
exports.deleteBanner = async (req, res) => {
  const { id } = req.params;
  try {
    await db.query('DELETE FROM banners WHERE id = ?', [id]);
    res.status(200).json({ success: true, message: 'Banner deleted successfully.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Fetch SEO tags
exports.getSEO = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM seo_metadata');
    res.status(200).json({ success: true, data: rows });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update SEO tag
exports.updateSEO = async (req, res) => {
  const { page_name, title, description, keywords } = req.body;
  try {
    const [rows] = await db.query('SELECT id FROM seo_metadata WHERE page_name = ?', [page_name]);
    if (rows.length === 0) {
      await db.query(
        'INSERT INTO seo_metadata (page_name, title, description, keywords) VALUES (?, ?, ?, ?)',
        [page_name, title, description, keywords]
      );
    } else {
      await db.query(
        'UPDATE seo_metadata SET title = ?, description = ?, keywords = ? WHERE page_name = ?',
        [title, description, keywords, page_name]
      );
    }
    res.status(200).json({ success: true, message: `SEO metadata for ${page_name} updated successfully.` });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
