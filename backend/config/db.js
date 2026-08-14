const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD !== undefined ? process.env.DB_PASSWORD : '',
  port: process.env.DB_PORT || 3306,
  database: process.env.DB_NAME || 'sdc_canteen',
  multipleStatements: true // Allow executing setup.sql
};

let pool;

async function initializeDatabase() {
  const isLocal = !process.env.DB_HOST || process.env.DB_HOST === 'localhost' || process.env.DB_HOST === '127.0.0.1';

  try {
    if (isLocal) {
      // 1. First connect without a database selected (local only)
      const { database, ...connectConfig } = dbConfig;
      const connection = await mysql.createConnection(connectConfig);
      console.log('Connected to local MySQL server successfully.');

      // 2. Create the database if it doesn't exist (local only)
      await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbConfig.database}\`;`);
      console.log(`Database "${dbConfig.database}" verified/created locally.`);
      await connection.end();
    }

    // 3. Create the connection pool with the database selected
    pool = mysql.createPool(dbConfig);

    // 4. Check if the "products" table already exists. If not, run setup.sql
    const [tables] = await pool.query("SHOW TABLES LIKE 'products'");
    if (tables.length === 0) {
      console.log('Tables do not exist. Initializing database schema and seeds from setup.sql...');
      const sqlPath = path.join(__dirname, '..', 'setup.sql');
      const sqlContent = fs.readFileSync(sqlPath, 'utf8');

      // Execute the setup script
      await pool.query(sqlContent);
      console.log('Database schema and seed data successfully initialized.');
      
      // Hash admin password from env or fall back to default for local development
      const bcrypt = require('bcryptjs');
      const adminUser = process.env.ADMIN_USERNAME || 'admin';
      const adminPass = process.env.ADMIN_PASSWORD || 'admin123';
      const hashedPassword = await bcrypt.hash(adminPass, 10);
      await pool.query(
        'INSERT IGNORE INTO admin_users (id, username, password) VALUES (1, ?, ?)',
        [adminUser, hashedPassword]
      );
      if (!process.env.ADMIN_PASSWORD) {
        console.log('Default administrator created. (username: admin, password: admin123)');
      } else {
        console.log(`Administrator "${adminUser}" verified/created from environment variables.`);
      }
    } else {
      console.log('Database tables already exist. Skipping seed process.');
    }

    // 5. Ensure users and wishlist_items tables exist (for schema updates on existing installs)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(50) NOT NULL UNIQUE,
        email VARCHAR(100) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        full_name VARCHAR(100) DEFAULT NULL,
        phone VARCHAR(20) DEFAULT NULL,
        address TEXT DEFAULT NULL,
        city VARCHAR(100) DEFAULT NULL,
        state VARCHAR(100) DEFAULT NULL,
        pincode VARCHAR(20) DEFAULT NULL,
        role VARCHAR(20) DEFAULT 'customer',
        status VARCHAR(20) DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Safely add missing columns to existing installs
    const addColumnIfMissing = async (tableName, columnName, definition) => {
      const [cols] = await pool.query(`SHOW COLUMNS FROM ${tableName} LIKE '${columnName}'`);
      if (cols.length === 0) {
        await pool.query(`ALTER TABLE ${tableName} ADD COLUMN ${columnName} ${definition}`);
        console.log(`Column '${columnName}' successfully added to table '${tableName}'.`);
      }
    };

    await addColumnIfMissing('users', 'city', 'VARCHAR(100) DEFAULT NULL');
    await addColumnIfMissing('users', 'state', 'VARCHAR(100) DEFAULT NULL');
    await addColumnIfMissing('users', 'pincode', 'VARCHAR(20) DEFAULT NULL');
    await addColumnIfMissing('users', 'role', "VARCHAR(20) DEFAULT 'customer'");
    await addColumnIfMissing('users', 'status', "VARCHAR(20) DEFAULT 'active'");
    await addColumnIfMissing('products', 'aplus_content', 'TEXT DEFAULT NULL');
    await addColumnIfMissing('products', 'amazon_link', 'TEXT DEFAULT NULL');
    await addColumnIfMissing('products', 'flipkart_link', 'TEXT DEFAULT NULL');

    await pool.query(`
      CREATE TABLE IF NOT EXISTS wishlist_items (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        product_id INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
        UNIQUE KEY unique_user_product (user_id, product_id)
      );
    `);

    // Ensure orders table exists
    await pool.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id INT AUTO_INCREMENT PRIMARY KEY,
        order_number VARCHAR(50) NOT NULL UNIQUE,
        user_id INT NOT NULL,
        full_name VARCHAR(100) NOT NULL,
        phone VARCHAR(20) NOT NULL,
        address TEXT NOT NULL,
        payment_method VARCHAR(20) DEFAULT 'cod',
        subtotal DECIMAL(10, 2) NOT NULL,
        gst DECIMAL(10, 2) NOT NULL,
        total DECIMAL(10, 2) NOT NULL,
        status VARCHAR(20) DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );
    `);

    // Ensure order_items table exists
    await pool.query(`
      CREATE TABLE IF NOT EXISTS order_items (
        id INT AUTO_INCREMENT PRIMARY KEY,
        order_id INT NOT NULL,
        product_id INT DEFAULT NULL,
        product_name VARCHAR(255) NOT NULL,
        price DECIMAL(10, 2) NOT NULL,
        quantity INT NOT NULL,
        FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL
      );
    `);
    console.log('User, Wishlist, and Order database tables verified/created.');
  } catch (error) {
    console.error('Database initialization failed:', error);
    process.exit(1);
  }
}

// Export the pool and the init function
module.exports = {
  initializeDatabase,
  query: (sql, params) => pool.query(sql, params),
  getPool: () => pool
};
