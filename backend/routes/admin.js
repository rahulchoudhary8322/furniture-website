const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');

router.post('/login', adminController.login);
router.get('/verify', auth, adminController.verifySession);

// Contact details
router.get('/contact', adminController.getContactDetails);
router.post('/contact', auth, adminController.updateContactDetails);

// Banners
router.get('/banners', adminController.getBanners);
router.post('/banners', auth, upload.single('image'), adminController.addBanner);
router.delete('/banners/:id', auth, adminController.deleteBanner);

const db = require('../config/db');

// SEO Meta
router.get('/seo', adminController.getSEO);
router.post('/seo', auth, adminController.updateSEO);

// Registered users list for Admin Panel
router.get('/users', auth, async (req, res) => {
  try {
    const [users] = await db.query(
      'SELECT id, username, email, full_name, phone, address, city, state, pincode, role, status, created_at FROM users ORDER BY created_at DESC'
    );
    res.status(200).json({ success: true, data: users });
  } catch (error) {
    console.error('Fetch users list error:', error);
    res.status(500).json({ success: false, message: 'Server error fetching users list.' });
  }
});

module.exports = router;
