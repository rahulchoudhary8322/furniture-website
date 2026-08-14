const db = require('../config/db');

const makeSlug = (text) => {
  return text
    .toString()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
};

// BRANDS
exports.getBrands = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM brands ORDER BY name ASC');
    res.status(200).json({ success: true, data: rows });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.addBrand = async (req, res) => {
  const { name } = req.body;
  const slug = makeSlug(name);
  try {
    await db.query('INSERT INTO brands (name, slug) VALUES (?, ?)', [name, slug]);
    res.status(201).json({ success: true, message: 'Brand added successfully.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteBrand = async (req, res) => {
  const { id } = req.params;
  try {
    await db.query('DELETE FROM brands WHERE id = ?', [id]);
    res.status(200).json({ success: true, message: 'Brand deleted successfully.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// MATERIALS
exports.getMaterials = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM materials ORDER BY name ASC');
    res.status(200).json({ success: true, data: rows });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.addMaterial = async (req, res) => {
  const { name } = req.body;
  const slug = makeSlug(name);
  try {
    await db.query('INSERT INTO materials (name, slug) VALUES (?, ?)', [name, slug]);
    res.status(201).json({ success: true, message: 'Material added successfully.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteMaterial = async (req, res) => {
  const { id } = req.params;
  try {
    await db.query('DELETE FROM materials WHERE id = ?', [id]);
    res.status(200).json({ success: true, message: 'Material deleted successfully.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// COLORS
exports.getColors = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM colors ORDER BY name ASC');
    res.status(200).json({ success: true, data: rows });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.addColor = async (req, res) => {
  const { name, code } = req.body;
  try {
    await db.query('INSERT INTO colors (name, code) VALUES (?, ?)', [name, code]);
    res.status(201).json({ success: true, message: 'Color added successfully.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteColor = async (req, res) => {
  const { id } = req.params;
  try {
    await db.query('DELETE FROM colors WHERE id = ?', [id]);
    res.status(200).json({ success: true, message: 'Color deleted successfully.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
