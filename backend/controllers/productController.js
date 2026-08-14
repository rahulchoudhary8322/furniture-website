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

// Fetch products with dynamic filters & sorting
exports.getProducts = async (req, res) => {
  try {
    const {
      category, 
      minPrice,
      maxPrice,
      material, 
      brand, 
      color, 
      availability, 
      rating, 
      search, 
      sortBy,
      featured,
      bestseller,
      newarrival
    } = req.query;

    let queryStr = `
      SELECT p.*, c.name as category_name, c.slug as category_slug, 
             b.name as brand_name, m.name as material_name, col.name as color_name, col.code as color_code,
             (SELECT image_url FROM product_images WHERE product_id = p.id ORDER BY is_primary DESC, id ASC LIMIT 1) as primary_image
      FROM products p
      INNER JOIN categories c ON p.category_id = c.id
      LEFT JOIN brands b ON p.brand_id = b.id
      LEFT JOIN materials m ON p.material_id = m.id
      LEFT JOIN colors col ON p.color_id = col.id
      WHERE p.is_available = 1
    `;
    const params = [];

    // Filter by Category (and all its subcategories recursively)
    if (category) {
      const [catRows] = await db.query('SELECT id FROM categories WHERE slug = ?', [category]);
      if (catRows.length > 0) {
        const catId = catRows[0].id;
        // Fetch subcategories
        const [subcatRows] = await db.query(
          'SELECT id FROM categories WHERE parent_id = ? OR parent_id IN (SELECT id FROM categories WHERE parent_id = ?)', 
          [catId, catId]
        );
        const catIds = [catId, ...subcatRows.map(r => r.id)];
        queryStr += ` AND p.category_id IN (${catIds.map(() => '?').join(',')})`;
        params.push(...catIds);
      } else {
        queryStr += ` AND 1=0`; // No category matches, return empty
      }
    }

    // Filter by Min/Max Price (checking sale_price if exists, else price)
    if (minPrice) {
      queryStr += ` AND COALESCE(p.sale_price, p.price) >= ?`;
      params.push(parseFloat(minPrice));
    }
    if (maxPrice) {
      queryStr += ` AND COALESCE(p.sale_price, p.price) <= ?`;
      params.push(parseFloat(maxPrice));
    }

    // Material filters
    if (material) {
      const materialList = material.split(',');
      queryStr += ` AND m.slug IN (${materialList.map(() => '?').join(',')})`;
      params.push(...materialList);
    }

    // Brand filters
    if (brand) {
      const brandList = brand.split(',');
      queryStr += ` AND b.slug IN (${brandList.map(() => '?').join(',')})`;
      params.push(...brandList);
    }

    // Color filters
    if (color) {
      const colorList = color.split(',');
      queryStr += ` AND p.color_id IN (${colorList.map(() => '?').join(',')})`;
      params.push(...colorList.map(c => parseInt(c)));
    }

    // Availability
    if (availability === 'in_stock') {
      queryStr += ` AND p.stock > 0`;
    }

    // Min Rating
    if (rating) {
      queryStr += ` AND p.rating >= ?`;
      params.push(parseFloat(rating));
    }

    // Quick Promotion flags
    if (featured === 'true') {
      queryStr += ` AND p.is_featured = 1`;
    }
    if (bestseller === 'true') {
      queryStr += ` AND p.is_best_seller = 1`;
    }
    if (newarrival === 'true') {
      queryStr += ` AND p.is_new_arrival = 1`;
    }

    // Search query
    if (search) {
      queryStr += ` AND (p.name LIKE ? OR c.name LIKE ? OR b.name LIKE ? OR m.name LIKE ? OR p.description LIKE ?)`;
      const searchParam = `%${search}%`;
      params.push(searchParam, searchParam, searchParam, searchParam, searchParam);
    }

    // Sorting
    if (sortBy === 'price_asc') {
      queryStr += ` ORDER BY COALESCE(p.sale_price, p.price) ASC`;
    } else if (sortBy === 'price_desc') {
      queryStr += ` ORDER BY COALESCE(p.sale_price, p.price) DESC`;
    } else if (sortBy === 'rating') {
      queryStr += ` ORDER BY p.rating DESC`;
    } else if (sortBy === 'newest') {
      queryStr += ` ORDER BY p.created_at DESC`;
    } else {
      queryStr += ` ORDER BY p.id DESC`;
    }

    const [products] = await db.query(queryStr, params);
    res.status(200).json({ success: true, count: products.length, data: products });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Fetch product details, secondary images, reviews, and related products
exports.getProductDetails = async (req, res) => {
  const { slug } = req.params;
  try {
    // 1. Fetch product basic details
    const queryStr = `
      SELECT p.*, c.name as category_name, c.slug as category_slug, c.parent_id as category_parent_id,
             b.name as brand_name, m.name as material_name, col.name as color_name, col.code as color_code
      FROM products p
      INNER JOIN categories c ON p.category_id = c.id
      LEFT JOIN brands b ON p.brand_id = b.id
      LEFT JOIN materials m ON p.material_id = m.id
      LEFT JOIN colors col ON p.color_id = col.id
      WHERE p.slug = ? LIMIT 1
    `;
    const [rows] = await db.query(queryStr, [slug]);
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    const product = rows[0];

    // 2. Fetch all product images
    const [images] = await db.query('SELECT * FROM product_images WHERE product_id = ? ORDER BY is_primary DESC, id ASC', [product.id]);

    // 3. Fetch all reviews
    const [reviews] = await db.query('SELECT * FROM reviews WHERE product_id = ? AND is_approved = 1 ORDER BY created_at DESC', [product.id]);

    // 4. Fetch related products (same category or same parent category, excluding self)
    const relatedQuery = `
      SELECT p.id, p.name, p.slug, p.price, p.sale_price, p.rating,
             (SELECT image_url FROM product_images WHERE product_id = p.id ORDER BY is_primary DESC, id ASC LIMIT 1) as primary_image
      FROM products p
      WHERE p.category_id = ? AND p.id != ? AND p.is_available = 1
      LIMIT 4
    `;
    const [related] = await db.query(relatedQuery, [product.category_id, product.id]);

    res.status(200).json({
      success: true,
      data: {
        ...product,
        images,
        reviews,
        related
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Add product (Admin only)
exports.addProduct = async (req, res) => {
  const {
    name, description, price, sale_price, stock, sku, category_id,
    brand_id, material_id, color_id, is_featured, is_best_seller, is_new_arrival,
    warranty, specifications, features, delivery_info, aplus_content,
    amazon_link, flipkart_link
  } = req.body;

  const slug = makeSlug(name);

  try {
    // 1. Process A+ content files and build aplus_content JSON
    let aplusObj = {};
    if (aplus_content) {
      try {
        aplusObj = typeof aplus_content === 'string' ? JSON.parse(aplus_content) : aplus_content;
      } catch (e) {
        aplusObj = {};
      }
    }

    if (req.files && req.files.length > 0) {
      const bannerFile = req.files.find(f => f.fieldname === 'aplus_banner_file');
      if (bannerFile) {
        aplusObj.banner_image = `/uploads/${bannerFile.filename}`;
      }

      const storyFile = req.files.find(f => f.fieldname === 'aplus_story_file');
      if (storyFile) {
        aplusObj.story_image = `/uploads/${storyFile.filename}`;
      }

      req.files.forEach(file => {
        if (file.fieldname.startsWith('aplus_feature_file_')) {
          const idx = parseInt(file.fieldname.split('_').pop());
          if (!aplusObj.features) aplusObj.features = [];
          if (!aplusObj.features[idx]) aplusObj.features[idx] = {};
          aplusObj.features[idx].image = `/uploads/${file.filename}`;
        }
      });
    }

    const finalAplusContent = Object.keys(aplusObj).length > 0 ? JSON.stringify(aplusObj) : null;

    const [result] = await db.query(
      `INSERT INTO products 
       (name, slug, description, price, sale_price, stock, sku, category_id, brand_id, material_id, color_id, 
        is_featured, is_best_seller, is_new_arrival, warranty, specifications, features, delivery_info, aplus_content,
        amazon_link, flipkart_link) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        name, slug, description, parseFloat(price), sale_price ? parseFloat(sale_price) : null, parseInt(stock), sku, parseInt(category_id),
        brand_id ? parseInt(brand_id) : null, material_id ? parseInt(material_id) : null, color_id ? parseInt(color_id) : null,
        is_featured === 'true' ? 1 : 0, is_best_seller === 'true' ? 1 : 0, is_new_arrival === 'true' ? 1 : 0,
        warranty, specifications, features, delivery_info, finalAplusContent,
        amazon_link || null, flipkart_link || null
      ]
    );

    const productId = result.insertId;

    // Handle gallery image uploads
    if (req.files && req.files.length > 0) {
      const galleryFiles = req.files.filter(f => f.fieldname === 'images');
      const imgQueries = galleryFiles.map((file, index) => {
        const imageUrl = `/uploads/${file.filename}`;
        const isPrimary = index === 0 ? 1 : 0;
        return db.query('INSERT INTO product_images (product_id, image_url, is_primary) VALUES (?, ?, ?)', [productId, imageUrl, isPrimary]);
      });
      await Promise.all(imgQueries);
    }

    res.status(201).json({ success: true, message: 'Product added successfully.', productId });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Edit Product (Admin only)
exports.editProduct = async (req, res) => {
  const { id } = req.params;
  const {
    name, description, price, sale_price, stock, sku, category_id,
    brand_id, material_id, color_id, is_featured, is_best_seller, is_new_arrival, is_available,
    warranty, specifications, features, delivery_info, aplus_content,
    amazon_link, flipkart_link
  } = req.body;

  const slug = makeSlug(name);

  try {
    // 1. Process A+ content files and build aplus_content JSON
    let aplusObj = {};
    if (aplus_content) {
      try {
        aplusObj = typeof aplus_content === 'string' ? JSON.parse(aplus_content) : aplus_content;
      } catch (e) {
        aplusObj = {};
      }
    }

    if (req.files && req.files.length > 0) {
      const bannerFile = req.files.find(f => f.fieldname === 'aplus_banner_file');
      if (bannerFile) {
        aplusObj.banner_image = `/uploads/${bannerFile.filename}`;
      }

      const storyFile = req.files.find(f => f.fieldname === 'aplus_story_file');
      if (storyFile) {
        aplusObj.story_image = `/uploads/${storyFile.filename}`;
      }

      req.files.forEach(file => {
        if (file.fieldname.startsWith('aplus_feature_file_')) {
          const idx = parseInt(file.fieldname.split('_').pop());
          if (!aplusObj.features) aplusObj.features = [];
          if (!aplusObj.features[idx]) aplusObj.features[idx] = {};
          aplusObj.features[idx].image = `/uploads/${file.filename}`;
        }
      });
    }

    const finalAplusContent = Object.keys(aplusObj).length > 0 ? JSON.stringify(aplusObj) : null;

    await db.query(
      `UPDATE products SET 
        name = ?, slug = ?, description = ?, price = ?, sale_price = ?, stock = ?, sku = ?, category_id = ?, 
        brand_id = ?, material_id = ?, color_id = ?, is_featured = ?, is_best_seller = ?, is_new_arrival = ?, is_available = ?,
        warranty = ?, specifications = ?, features = ?, delivery_info = ?, aplus_content = ?,
        amazon_link = ?, flipkart_link = ?
      WHERE id = ?`,
      [
        name, slug, description, parseFloat(price), sale_price ? parseFloat(sale_price) : null, parseInt(stock), sku, parseInt(category_id),
        brand_id ? parseInt(brand_id) : null, material_id ? parseInt(material_id) : null, color_id ? parseInt(color_id) : null,
        is_featured === 'true' || is_featured === '1' ? 1 : 0, 
        is_best_seller === 'true' || is_best_seller === '1' ? 1 : 0, 
        is_new_arrival === 'true' || is_new_arrival === '1' ? 1 : 0,
        is_available === 'false' || is_available === '0' ? 0 : 1,
        warranty, specifications, features, delivery_info, finalAplusContent,
        amazon_link || null, flipkart_link || null, parseInt(id)
      ]
    );

    // Handle new gallery image uploads if any are provided
    if (req.files && req.files.length > 0) {
      const galleryFiles = req.files.filter(f => f.fieldname === 'images');
      const imgQueries = galleryFiles.map((file) => {
        const imageUrl = `/uploads/${file.filename}`;
        return db.query('INSERT INTO product_images (product_id, image_url, is_primary) VALUES (?, ?, 0)', [id, imageUrl]);
      });
      await Promise.all(imgQueries);
    }

    res.status(200).json({ success: true, message: 'Product updated successfully.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete Product (Admin only)
exports.deleteProduct = async (req, res) => {
  const { id } = req.params;
  try {
    await db.query('DELETE FROM products WHERE id = ?', [id]);
    res.status(200).json({ success: true, message: 'Product deleted successfully.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Clear Product Images (Optional helper, helps manage replacing images)
exports.clearProductImages = async (req, res) => {
  const { id } = req.params;
  try {
    await db.query('DELETE FROM product_images WHERE product_id = ?', [id]);
    res.status(200).json({ success: true, message: 'Product images cleared.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Add product review
exports.addProductReview = async (req, res) => {
  const { id } = req.params; // Product ID
  const { customer_name, rating, comment } = req.body;
  try {
    await db.query(
      'INSERT INTO reviews (product_id, customer_name, rating, comment, is_approved) VALUES (?, ?, ?, ?, 1)',
      [parseInt(id), customer_name, parseInt(rating), comment]
    );

    // Re-calculate product average rating
    const [avgRows] = await db.query('SELECT AVG(rating) as avg_rating FROM reviews WHERE product_id = ? AND is_approved = 1', [id]);
    const avgRating = avgRows[0].avg_rating || 5.0;
    await db.query('UPDATE products SET rating = ? WHERE id = ?', [avgRating, id]);

    res.status(201).json({ success: true, message: 'Review added successfully.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get reviews (Admin only - manage reviews)
exports.getAllReviews = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT r.*, p.name as product_name 
      FROM reviews r 
      INNER JOIN products p ON r.product_id = p.id 
      ORDER BY r.created_at DESC
    `);
    res.status(200).json({ success: true, data: rows });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete review (Admin only)
exports.deleteReview = async (req, res) => {
  const { id } = req.params;
  try {
    // Get product_id before deleting to recalculate average rating
    const [rows] = await db.query('SELECT product_id FROM reviews WHERE id = ?', [id]);
    if (rows.length > 0) {
      const productId = rows[0].product_id;
      await db.query('DELETE FROM reviews WHERE id = ?', [id]);

      const [avgRows] = await db.query('SELECT AVG(rating) as avg_rating FROM reviews WHERE product_id = ? AND is_approved = 1', [productId]);
      const avgRating = avgRows[0].avg_rating || 5.0;
      await db.query('UPDATE products SET rating = ? WHERE id = ?', [avgRating, productId]);
    }
    res.status(200).json({ success: true, message: 'Review deleted successfully.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
