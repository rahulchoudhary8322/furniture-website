const db = require('../config/db');

// Helper to format slug
const makeSlug = (text) => {
  return text
    .toString()
    .toLowerCase()
    .replace(/\s+/g, '-')           // Replace spaces with -
    .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
    .replace(/\-\-+/g, '-')         // Replace multiple - with single -
    .replace(/^-+/, '')             // Trim - from start
    .replace(/-+$/, '');            // Trim - from end
};

// Fetch categories flat list or tree
exports.getCategories = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM categories ORDER BY parent_id ASC, name ASC');
    res.status(200).json({ success: true, data: rows });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Fetch hierarchical category tree for the Mega Menu
exports.getCategoryTree = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM categories ORDER BY id ASC');
    
    // Build maps for hierarchy
    const categoryMap = {};
    const rootCategories = [];

    rows.forEach(cat => {
      categoryMap[cat.id] = { ...cat, children: [] };
    });

    rows.forEach(cat => {
      if (cat.parent_id) {
        const parent = categoryMap[cat.parent_id];
        if (parent) {
          parent.children.push(categoryMap[cat.id]);
        }
      } else {
        rootCategories.push(categoryMap[cat.id]);
      }
    });

    res.status(200).json({ success: true, data: rootCategories });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Add Category or Subcategory
exports.addCategory = async (req, res) => {
  const { name, parent_id } = req.body;
  const slug = makeSlug(name);
  let image_url = null;

  if (req.file) {
    image_url = `/uploads/${req.file.filename}`;
  }

  try {
    const [result] = await db.query(
      'INSERT INTO categories (name, slug, parent_id, image_url) VALUES (?, ?, ?, ?)',
      [name, slug, parent_id && parent_id !== 'null' && parent_id !== '' ? parseInt(parent_id) : null, image_url]
    );
    res.status(201).json({ success: true, message: 'Category added successfully.', id: result.insertId });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Edit Category
exports.editCategory = async (req, res) => {
  const { id } = req.params;
  const { name, parent_id } = req.body;
  const slug = makeSlug(name);
  let image_url = null;

  if (req.file) {
    image_url = `/uploads/${req.file.filename}`;
  }

  try {
    let query = 'UPDATE categories SET name = ?, slug = ?, parent_id = ?';
    let params = [name, slug, parent_id && parent_id !== 'null' && parent_id !== '' ? parseInt(parent_id) : null];

    if (image_url) {
      query += ', image_url = ?';
      params.push(image_url);
    }

    query += ' WHERE id = ?';
    params.push(parseInt(id));

    await db.query(query, params);
    res.status(200).json({ success: true, message: 'Category updated successfully.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete Category
exports.deleteCategory = async (req, res) => {
  const { id } = req.params;
  try {
    await db.query('DELETE FROM categories WHERE id = ?', [id]);
    res.status(200).json({ success: true, message: 'Category deleted successfully.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
