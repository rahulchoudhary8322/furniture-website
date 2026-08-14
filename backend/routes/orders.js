const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const userAuth = require('../middleware/userAuth');
const auth = require('../middleware/auth');

// Customer endpoints
router.post('/', userAuth, orderController.createOrder);
router.get('/', userAuth, orderController.getCustomerOrders);

// Admin endpoints
router.get('/admin', auth, orderController.getAdminOrders);
router.put('/admin/:id/status', auth, orderController.updateOrderStatus);

module.exports = router;
