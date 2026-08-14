const mysql = require('mysql2/promise');
require('dotenv').config({ path: './.env' });

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'sdc_canteen',
  port: parseInt(process.env.DB_PORT || '3306')
};

const extraProducts = [
  // 1. Study Table
  {
    categorySlug: 'study-table',
    name: 'SDC Classic Wooden Study Desk',
    slug: 'sdc-classic-wooden-study-desk',
    description: 'Solid wood study desk with drawer and cabinet, premium teak finish.',
    price: 5999,
    sku: 'SDC-ST-01',
    image: '/uploads/cat-study-table.jpg'
  },
  {
    categorySlug: 'study-table',
    name: 'SDC Elite Ergonomic Study Table',
    slug: 'sdc-elite-ergonomic-study-table',
    description: 'Modern study table with metal frame, adjustable height and cable management.',
    price: 7999,
    sku: 'SDC-ST-02',
    image: '/uploads/cat-study-table.jpg'
  },
  // 2. Almirah
  {
    categorySlug: 'almirah',
    name: 'SDC Royal Double Door Wardrobe',
    slug: 'sdc-royal-double-door-wardrobe',
    description: 'Premium engineered wood wardrobe with mirror, safety locker, and hanger rods.',
    price: 18999,
    sku: 'SDC-AL-01',
    image: '/uploads/cat-almera.jpg'
  },
  {
    categorySlug: 'almirah',
    name: 'SDC Heavy Duty Steel Almirah',
    slug: 'sdc-heavy-duty-steel-almirah',
    description: 'Durable metal wardrobe with powder coated anti-rust finish, classic storage locker.',
    price: 14999,
    sku: 'SDC-AL-02',
    image: '/uploads/cat-almera.jpg'
  },
  // 3. Outdoor Chair
  {
    categorySlug: 'outdoor-chair',
    name: 'SDC Rattan Garden Chair Set',
    slug: 'sdc-rattan-garden-chair-set',
    description: 'Set of 2 outdoor garden chairs with cushions, weather-resistant synthetic rattan weave.',
    price: 8999,
    sku: 'SDC-OC-01',
    image: '/uploads/cat-outdoor-chair.jpg'
  },
  {
    categorySlug: 'outdoor-chair',
    name: 'SDC Relaxing Patio Lounge Chair',
    slug: 'sdc-relaxing-patio-lounge-chair',
    description: 'Adjustable folding patio lounge chair with breathable mesh fabric.',
    price: 4599,
    sku: 'SDC-OC-02',
    image: '/uploads/cat-outdoor-chair.jpg'
  },
  // 4. Dressing Table
  {
    categorySlug: 'dressing-table',
    name: 'SDC Elegant Walnut Vanity Dresser',
    slug: 'sdc-elegant-walnut-vanity-dresser',
    description: 'Handcrafted dressing table with slide-out vanity mirror and jewelry drawers.',
    price: 11999,
    sku: 'SDC-DT-01',
    image: '/uploads/cat-dressing-table.jpg'
  },
  {
    categorySlug: 'dressing-table',
    name: 'SDC Modern Glass Top LED Dressing Table',
    slug: 'sdc-modern-glass-top-led-dressing-table',
    description: 'Vanity dresser with touch-activated smart LED light mirror and luxury drawers.',
    price: 15999,
    sku: 'SDC-DT-02',
    image: '/uploads/cat-dressing-table.jpg'
  },
  // 5. Coffee Table
  {
    categorySlug: 'coffee-table',
    name: 'SDC Nesting Coffee Table Set',
    slug: 'sdc-nesting-coffee-table-set',
    description: 'Set of 3 nesting round coffee tables with marble top print and gold metal frames.',
    price: 6999,
    sku: 'SDC-CT-01',
    image: '/uploads/cat-coffee-table.jpg'
  },
  {
    categorySlug: 'coffee-table',
    name: 'SDC Solid Teak Wood Center Table',
    slug: 'sdc-solid-teak-wood-center-table',
    description: 'Classic wooden coffee table with magazine shelf, natural matte teak finish.',
    price: 8499,
    sku: 'SDC-CT-02',
    image: '/uploads/cat-coffee-table.jpg'
  },
  // 6. Counter
  {
    categorySlug: 'counter',
    name: 'SDC Commercial Reception Desk',
    slug: 'sdc-commercial-reception-desk',
    description: 'L-shaped office cashier counter desk with cash drawers and security lock.',
    price: 24999,
    sku: 'SDC-CR-01',
    image: '/uploads/cat-counter.jpg'
  },
  {
    categorySlug: 'counter',
    name: 'SDC Compact Shop Billing Counter',
    slug: 'sdc-compact-shop-billing-counter',
    description: 'Cashier billing desk with glass front display shelf, perfect for retail stores.',
    price: 12999,
    sku: 'SDC-CR-02',
    image: '/uploads/cat-counter.jpg'
  },
  // 7. Air Conditioners
  {
    categorySlug: 'air-conditioners',
    name: 'SDC CoolBreeze 1.5 Ton Split AC',
    slug: 'sdc-coolbreeze-1-5-ton-split-ac',
    description: '5-star inverter split air conditioner with copper condenser and fast cooling.',
    price: 38999,
    sku: 'SDC-AC-01',
    image: '/uploads/tv-samsung-2.jpg'
  },
  // 8. Mobile Phones
  {
    categorySlug: 'mobile-phones',
    name: 'SDC SmartConnect Pro Smartphone',
    slug: 'sdc-smartconnect-pro-smartphone',
    description: 'High-performance smartphone with 6.5 inch display, 128GB storage, and 50MP camera.',
    price: 15999,
    sku: 'SDC-MP-01',
    image: '/uploads/cat-electronics.jpg'
  },
  // 9. Wall Clocks
  {
    categorySlug: 'wall-clocks',
    name: 'SDC Traditional Wooden Wall Clock',
    slug: 'sdc-traditional-wooden-wall-clock',
    description: 'Handcrafted round analog wall clock in solid wood, vintage Roman numerals.',
    price: 1599,
    sku: 'SDC-WC-01',
    image: '/uploads/cat-decor.jpg'
  },
  // 10. Educational Toys
  {
    categorySlug: 'educational-toys',
    name: 'SDC Creative Wooden Building Blocks',
    slug: 'sdc-creative-wooden-building-blocks',
    description: 'Set of 50 multi-colored wooden blocks for creative learning and shapes recognition.',
    price: 1299,
    sku: 'SDC-ED-01',
    image: '/uploads/toy-blocks-1.jpg'
  }
];

async function seed() {
  try {
    const connection = await mysql.createConnection(dbConfig);
    console.log('Connected to database.');

    for (const prod of extraProducts) {
      // Find category ID by slug
      const [rows] = await connection.execute(
        'SELECT id FROM categories WHERE slug = ?',
        [prod.categorySlug]
      );

      if (rows.length === 0) {
        console.warn(`Category slug ${prod.categorySlug} not found. Skipping.`);
        continue;
      }

      const categoryId = rows[0].id;

      // Insert product
      const [pResult] = await connection.execute(
        `INSERT INTO products (name, slug, description, price, stock, sku, category_id, brand_id, material_id, color_id, is_featured, is_best_seller, is_new_arrival, rating)
         VALUES (?, ?, ?, ?, 10, ?, ?, 1, 3, 5, 1, 0, 1, 4.8)
         ON DUPLICATE KEY UPDATE category_id = VALUES(category_id), price = VALUES(price)`,
        [prod.name, prod.slug, prod.description, prod.price, prod.sku, categoryId]
      );

      // Find inserted product ID
      const [pRows] = await connection.execute(
        'SELECT id FROM products WHERE sku = ?',
        [prod.sku]
      );
      const productId = pRows[0].id;

      // Insert primary image
      await connection.execute(
        `INSERT INTO product_images (product_id, image_url, is_primary)
         VALUES (?, ?, 1)
         ON DUPLICATE KEY UPDATE image_url = VALUES(image_url)`,
        [productId, prod.image]
      );

      console.log(`Seeded extra product: ${prod.name}`);
    }

    await connection.end();
    console.log('Extra products seeding completed successfully.');
  } catch (err) {
    console.error('Error seeding extra products:', err.message);
  }
}

seed();
