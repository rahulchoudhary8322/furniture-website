const mysql = require('mysql2/promise');
require('dotenv').config({ path: './.env' });

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'sdc_canteen',
  port: parseInt(process.env.DB_PORT || '3306')
};

async function run() {
  try {
    const connection = await mysql.createConnection(dbConfig);
    console.log('Connected to MySQL database.');

    // 1. Relocate seeded products to parent subcategory levels before deleting children to avoid cascade deletion
    // Sofa sub-subcategories (19-23) and Recliner subcategories (17, 18) -> Move products to Sofa Sets (id 6)
    await connection.execute("UPDATE products SET category_id = 6 WHERE category_id IN (17, 18, 19, 20, 21, 22, 23)");
    console.log('Moved recliner and sofa products to parent category (Sofa)');

    // Dining tables sub-subcategories (24-26) -> Move products to Dining Tables (id 7)
    await connection.execute("UPDATE products SET category_id = 7 WHERE category_id IN (24, 25, 26)");
    console.log('Moved dining table products to parent category (Dining Set)');

    // 2. Rename existing Furniture categories to align with requested names and images
    await connection.execute(
      "UPDATE categories SET name = 'Sofa', slug = 'sofa-sets', image_url = '/uploads/cat-sofas.jpg' WHERE id = 6"
    );
    await connection.execute(
      "UPDATE categories SET name = 'Dining Set', slug = 'dining-tables', image_url = '/uploads/cat-dining.jpg' WHERE id = 7"
    );
    await connection.execute(
      "UPDATE categories SET name = 'Beds', slug = 'beds', image_url = '/uploads/cat-beds.jpg' WHERE id = 8"
    );
    console.log('Renamed existing Sofa, Dining Set, and Beds categories.');

    // 3. Safely delete unused sub-subcategories and old Recliner category
    await connection.execute("DELETE FROM categories WHERE id IN (5, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26)");
    console.log('Deleted obsolete sub-subcategories.');

    // 4. Seed the requested new subcategories under Furniture (parent_id = 1)
    const newSubcategories = [
      { name: 'Study Table', slug: 'study-table', image_url: '/uploads/cat-study-table.jpg' },
      { name: 'Almirah', slug: 'almirah', image_url: '/uploads/cat-almera.jpg' },
      { name: 'Outdoor Chair', slug: 'outdoor-chair', image_url: '/uploads/cat-outdoor-chair.jpg' },
      { name: 'Dressing Table', slug: 'dressing-table', image_url: '/uploads/cat-dressing-table.jpg' },
      { name: 'Coffee Table', slug: 'coffee-table', image_url: '/uploads/cat-coffee-table.jpg' },
      { name: 'Counter', slug: 'counter', image_url: '/uploads/cat-counter.jpg' }
    ];

    for (const cat of newSubcategories) {
      await connection.execute(
        "INSERT INTO categories (name, slug, parent_id, image_url) VALUES (?, ?, 1, ?) ON DUPLICATE KEY UPDATE name=VALUES(name), image_url=VALUES(image_url)",
        [cat.name, cat.slug, cat.image_url]
      );
    }
    console.log('Successfully seeded Study Table, Almirah, Outdoor Chair, Dressing Table, Coffee Table, and Counter.');

    await connection.end();
    console.log('Database category updates completed.');
  } catch (err) {
    console.error('Error updating categories in database:', err.message);
  }
}

run();
