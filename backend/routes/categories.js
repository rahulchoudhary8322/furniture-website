const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');

router.get('/', categoryController.getCategories);
router.get('/tree', categoryController.getCategoryTree);
router.post('/', auth, upload.single('image'), categoryController.addCategory);
router.put('/:id', auth, upload.single('image'), categoryController.editCategory);
router.delete('/:id', auth, categoryController.deleteCategory);

module.exports = router;
