const express = require('express');
const router = express.Router();
const db = require('../config/db');
const userAuth = require('../middleware/userAuth');

// 1. Get User Wishlist Product IDs
router.get('/', userAuth, async (req, res) => {
  try {
    const [items] = await db.query(
      'SELECT product_id FROM wishlist_items WHERE user_id = ?',
      [req.user.id]
    );
    const ids = items.map(item => item.product_id);
    res.status(200).json({ success: true, data: ids });
  } catch (error) {
    console.error('Fetch wishlist error:', error);
    res.status(500).json({ success: false, message: 'Server error fetching wishlist.' });
  }
});

// 2. Toggle Product in Wishlist
router.post('/toggle', userAuth, async (req, res) => {
  const { productId } = req.body;

  if (!productId) {
    return res.status(400).json({ success: false, message: 'Product ID is required.' });
  }

  try {
    // Check if it already exists
    const [existing] = await db.query(
      'SELECT id FROM wishlist_items WHERE user_id = ? AND product_id = ?',
      [req.user.id, productId]
    );

    if (existing.length > 0) {
      // Remove it
      await db.query(
        'DELETE FROM wishlist_items WHERE user_id = ? AND product_id = ?',
        [req.user.id, productId]
      );
      return res.status(200).json({ success: true, isWishlisted: false, message: 'Product removed from wishlist.' });
    } else {
      // Add it
      await db.query(
        'INSERT INTO wishlist_items (user_id, product_id) VALUES (?, ?)',
        [req.user.id, productId]
      );
      return res.status(200).json({ success: true, isWishlisted: true, message: 'Product added to wishlist.' });
    }
  } catch (error) {
    console.error('Toggle wishlist error:', error);
    res.status(500).json({ success: false, message: 'Server error toggling wishlist item.' });
  }
});

// 3. Batch Sync Wishlist from LocalStorage (after login)
router.post('/sync', userAuth, async (req, res) => {
  const { productIds } = req.body; // Array of product IDs

  if (!productIds || !Array.isArray(productIds)) {
    return res.status(400).json({ success: false, message: 'Invalid product IDs list.' });
  }

  try {
    if (productIds.length > 0) {
      // Insert all using INSERT IGNORE to skip existing combinations
      for (const pid of productIds) {
        await db.query(
          'INSERT IGNORE INTO wishlist_items (user_id, product_id) VALUES (?, ?)',
          [req.user.id, pid]
        );
      }
    }

    // Fetch the updated full list
    const [items] = await db.query(
      'SELECT product_id FROM wishlist_items WHERE user_id = ?',
      [req.user.id]
    );
    const ids = items.map(item => item.product_id);

    res.status(200).json({ success: true, data: ids, message: 'Wishlist synchronized.' });
  } catch (error) {
    console.error('Sync wishlist error:', error);
    res.status(500).json({ success: false, message: 'Server error synchronizing wishlist.' });
  }
});

module.exports = router;
