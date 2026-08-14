const express = require('express');
const router = express.Router();
const attributeController = require('../controllers/attributeController');
const auth = require('../middleware/auth');

// Brands
router.get('/brands', attributeController.getBrands);
router.post('/brands', auth, attributeController.addBrand);
router.delete('/brands/:id', auth, attributeController.deleteBrand);

// Materials
router.get('/materials', attributeController.getMaterials);
router.post('/materials', auth, attributeController.addMaterial);
router.delete('/materials/:id', auth, attributeController.deleteMaterial);

// Colors
router.get('/colors', attributeController.getColors);
router.post('/colors', auth, attributeController.addColor);
router.delete('/colors/:id', auth, attributeController.deleteColor);

module.exports = router;
