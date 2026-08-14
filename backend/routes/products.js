const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');

// Public routes
router.get('/', productController.getProducts);
router.get('/:slug', productController.getProductDetails);
router.post('/:id/reviews', productController.addProductReview);

// Admin-protected routes
router.post('/', auth, upload.any(), productController.addProduct);
router.put('/:id', auth, upload.any(), productController.editProduct);
router.delete('/:id', auth, productController.deleteProduct);
router.delete('/:id/images', auth, productController.clearProductImages);

// Review management (Admin only)
router.get('/admin/reviews', auth, productController.getAllReviews);
router.delete('/admin/reviews/:id', auth, productController.deleteReview);

module.exports = router;
