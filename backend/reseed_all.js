const mysql = require('mysql2/promise');
require('dotenv').config({ path: './.env' });

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'sdc_canteen',
  port: parseInt(process.env.DB_PORT || '3306')
};

const categoriesSeed = [
  // Parents
  { name: 'Furniture', slug: 'furniture', parentSlug: null, img: '/uploads/cat-furniture.jpg' },
  { name: 'Electronics', slug: 'electronics', parentSlug: null, img: '/uploads/cat-electronics.jpg' },
  { name: 'Home & Decor', slug: 'home-decor', parentSlug: null, img: '/uploads/cat-decor.jpg' },
  { name: 'Toys', slug: 'toys', parentSlug: null, img: '/uploads/cat-toys.jpg' },
  { name: 'Bicycle', slug: 'bicycle', parentSlug: null, img: '/uploads/cat-bicycle.jpg' },

  // Subcategories - Furniture
  { name: 'Sofa', slug: 'sofa-sets', parentSlug: 'furniture', img: '/uploads/cat-sofas.jpg' },
  { name: 'Beds', slug: 'beds', parentSlug: 'furniture', img: '/uploads/cat-beds.jpg' },
  { name: 'Dining Set', slug: 'dining-tables', parentSlug: 'furniture', img: '/uploads/cat-dining.jpg' },
  { name: 'Study Table', slug: 'study-table', parentSlug: 'furniture', img: '/uploads/cat-study-table.jpg' },
  { name: 'Almirah', slug: 'almirah', parentSlug: 'furniture', img: '/uploads/cat-almera.jpg' },
  { name: 'Outdoor Chair', slug: 'outdoor-chair', parentSlug: 'furniture', img: '/uploads/cat-outdoor-chair.jpg' },
  { name: 'Dressing Table', slug: 'dressing-table', parentSlug: 'furniture', img: '/uploads/cat-dressing-table.jpg' },
  { name: 'Coffee Table', slug: 'coffee-table', parentSlug: 'furniture', img: '/uploads/cat-coffee-table.jpg' },

  // Subcategories - Electronics
  { name: 'Washing Machine', slug: 'washing-machines', parentSlug: 'electronics', img: '/uploads/cat-washing-machines.jpg' },
  { name: 'Cooler', slug: 'coolers', parentSlug: 'electronics', img: '/uploads/cat-coolers.jpg' },
  { name: 'AC', slug: 'air-conditioners', parentSlug: 'electronics', img: '/uploads/cat-ac.jpg' },
  { name: 'Earbuds', slug: 'earbuds', parentSlug: 'electronics', img: '/uploads/cat-earbuds.jpg' },
  { name: 'Neckband', slug: 'neckbands', parentSlug: 'electronics', img: '/uploads/cat-neckbands.jpg' },

  // Subcategories - Home & Decor
  { name: 'Wall Clock', slug: 'wall-clocks', parentSlug: 'home-decor', img: '/uploads/cat-clocks.jpg' },
  { name: 'Statue', slug: 'statues', parentSlug: 'home-decor', img: '/uploads/cat-decor.jpg' },
  { name: 'Flower Pot', slug: 'flower-pots', parentSlug: 'home-decor', img: '/uploads/cat-flower-pots.jpg' },

  // Subcategories - Toys
  { name: 'Electronic Toy Car', slug: 'electronic-toy-cars', parentSlug: 'toys', img: '/uploads/cat-toy-cars.jpg' },
  { name: 'Electronic Kids Scooty', slug: 'electronic-kids-scooty', parentSlug: 'toys', img: '/uploads/cat-kids-scooty.jpg' },

  // Subcategories - Bicycle
  { name: 'Bicycle', slug: 'bicycles', parentSlug: 'bicycle', img: '/uploads/cat-bicycles.jpg' }
];

// Seed 3 high-quality products for each of the 19 subcategories
const productsSeed = {
  // Furniture
  'sofa-sets': [
    { name: 'SDC Royal Leatherette L-Shape Sofa', price: 34999, sku: 'SDC-SO-01', desc: 'Luxury L-shape sectional sofa set with plush high-density foam cushioning.', img: '/uploads/sofa-lshape-1.jpg' },
    { name: 'SDC Solid Teak Wood Sofa Set', price: 44999, sku: 'SDC-SO-02', desc: 'Classic wooden 5-seater sofa set crafted in premium solid teak wood.', img: '/uploads/sofa-wood-1.jpg' },
    { name: 'SDC Fabric 3-Seater Living Room Sofa', price: 18999, sku: 'SDC-SO-03', desc: 'Comfortable fabric 3-seater sofa set with solid wood legs and washable covers.', img: '/uploads/sofa-lshape-2.jpg' }
  ],
  'beds': [
    { name: 'SDC King Size Solid Wood Bed', price: 28999, sku: 'SDC-BD-01', desc: 'King size wooden double bed with spacious hydraulic storage underneath.', img: '/uploads/cat-beds.jpg' },
    { name: 'SDC Queen Size Engineered Wood Bed', price: 17999, sku: 'SDC-BD-02', desc: 'Sleek queen size bed with headboard shelves and drawers storage.', img: '/uploads/cat-beds.jpg' },
    { name: 'SDC Upholstered Luxury Double Bed', price: 32999, sku: 'SDC-BD-03', desc: 'Premium double bed with tufted fabric headboard cushioning and metal legs.', img: '/uploads/recline-lea-2.jpg' }
  ],
  'dining-tables': [
    { name: 'SDC Luxury 6-Seater Wooden Dining Set', price: 29999, sku: 'SDC-DN-01', desc: 'Solid wood 6-seater dining table set with cushioned chairs.', img: '/uploads/dining-6s-1.jpg' },
    { name: 'SDC Glass Top 4-Seater Dining Set', price: 15999, sku: 'SDC-DN-02', desc: 'Tempered glass top dining table with 4 metallic framed chairs.', img: '/uploads/dining-6s-2.jpg' },
    { name: 'SDC Sheesham Wood 6-Seater Dining Table', price: 34999, sku: 'SDC-DN-03', desc: '100% pure Sheesham wood dining set with rich honey matte finish.', img: '/uploads/dining-6s-1.jpg' }
  ],
  'study-table': [
    { name: 'SDC Classic Wooden Study Desk', price: 5999, sku: 'SDC-ST-01', desc: 'Solid wood study desk with drawer and cabinet, premium teak finish.', img: '/uploads/cat-study-table.jpg' },
    { name: 'SDC Elite Ergonomic Study Table', price: 7999, sku: 'SDC-ST-02', desc: 'Modern study table with metal frame, adjustable height and cable management.', img: '/uploads/cat-study-table.jpg' },
    { name: 'SDC Compact Office Writing Desk', price: 3999, sku: 'SDC-ST-03', desc: 'Sleek workspace desk with keyboard tray and shelving space.', img: '/uploads/cat-study-table.jpg' }
  ],
  'almirah': [
    { name: 'SDC Royal Double Door Wardrobe', price: 18999, sku: 'SDC-AL-01', desc: 'Premium engineered wood wardrobe with mirror, safety locker, and hanger rods.', img: '/uploads/cat-almera.jpg' },
    { name: 'SDC Heavy Duty Steel Almirah', price: 14999, sku: 'SDC-AL-02', desc: 'Durable metal wardrobe with powder coated anti-rust finish, classic storage locker.', img: '/uploads/cat-almera.jpg' },
    { name: 'SDC Modern Slider Wardrobe 3-Door', price: 27999, sku: 'SDC-AL-03', desc: 'Luxury sliding door wardrobe with glass mirror and LED interior lighting.', img: '/uploads/cat-almera.jpg' }
  ],
  'outdoor-chair': [
    { name: 'SDC Rattan Garden Chair Set', price: 8999, sku: 'SDC-OC-01', desc: 'Set of 2 outdoor garden chairs with cushions, weather-resistant build.', img: '/uploads/cat-outdoor-chair.jpg' },
    { name: 'SDC Relaxing Patio Lounge Chair', price: 4599, sku: 'SDC-OC-02', desc: 'Adjustable folding patio lounge chair with breathable mesh fabric.', img: '/uploads/cat-outdoor-chair.jpg' },
    { name: 'SDC Premium Cushioned Garden Armchair', price: 5299, sku: 'SDC-OC-03', desc: 'Outdoor armchair with washable cushions, UV-resistant frame.', img: '/uploads/recline-fab-1.jpg' }
  ],
  'dressing-table': [
    { name: 'SDC Elegant Walnut Vanity Dresser', price: 11999, sku: 'SDC-DT-01', desc: 'Handcrafted dressing table with slide-out vanity mirror and jewelry drawers.', img: '/uploads/cat-dressing-table.jpg' },
    { name: 'SDC Modern Glass Top LED Dressing Table', price: 15999, sku: 'SDC-DT-02', desc: 'Vanity dresser with touch-activated smart LED light mirror and luxury drawers.', img: '/uploads/cat-dressing-table.jpg' },
    { name: 'SDC Traditional Sheesham Dresser', price: 9999, sku: 'SDC-DT-03', desc: 'Classic wooden dressing table with full length mirror and cabinet drawer.', img: '/uploads/cat-dressing-table.jpg' }
  ],
  'coffee-table': [
    { name: 'SDC Nesting Coffee Table Set', price: 6999, sku: 'SDC-CT-01', desc: 'Set of 3 nesting round coffee tables with marble top print and gold metal frames.', img: '/uploads/cat-coffee-table.jpg' },
    { name: 'SDC Solid Teak Wood Center Table', price: 8499, sku: 'SDC-CT-02', desc: 'Classic wooden coffee table with magazine shelf, natural matte teak finish.', img: '/uploads/cat-coffee-table.jpg' },
    { name: 'SDC Glass Top Coffee Table', price: 4999, sku: 'SDC-CT-03', desc: 'Tempered glass top center table with solid wood frame and bottom shelf.', img: '/uploads/cat-furniture.jpg' }
  ],

  // Electronics
  'washing-machines': [
    { name: 'SDC SmartWash 7.0kg Fully Automatic', price: 18999, sku: 'SDC-EL-WM1', desc: 'Front load fully automatic washing machine with steam wash and smart inverter.', img: '/uploads/cat-washing-machines.jpg' },
    { name: 'SDC Turbocool 6.5kg Top Load Washer', price: 12999, sku: 'SDC-EL-WM2', desc: 'Top load washing machine with multi-cycle wash and turbo dry technology.', img: '/uploads/cat-washing-machines.jpg' },
    { name: 'SDC Compact 6.0kg Semi-Automatic', price: 8499, sku: 'SDC-EL-WM3', desc: 'Twin tub semi-automatic washer dryer with heavy duty scrub pulsator.', img: '/uploads/cat-washing-machines.jpg' }
  ],
  'coolers': [
    { name: 'SDC DesertStorm 80L Air Cooler', price: 10999, sku: 'SDC-EL-CL1', desc: 'Powerful desert air cooler with honeycomb pads and 3-way speed settings.', img: '/uploads/cat-coolers.jpg' },
    { name: 'SDC SlimTower 35L Room Cooler', price: 6499, sku: 'SDC-EL-CL2', desc: 'Personal tower cooler with ice chamber and remote control support.', img: '/uploads/cat-coolers.jpg' },
    { name: 'SDC Blizzard 50L Window Air Cooler', price: 8999, sku: 'SDC-EL-CL3', desc: 'Window-fit air cooler with rust-proof ABS body and silent fan operation.', img: '/uploads/cat-coolers.jpg' }
  ],
  'air-conditioners': [
    { name: 'SDC CoolBreeze 1.5 Ton Split AC', price: 38999, sku: 'SDC-AC-01', desc: '5-star inverter split air conditioner with copper condenser and fast cooling.', img: '/uploads/cat-ac.jpg' },
    { name: 'SDC Premium Window AC 1.0 Ton', price: 24999, sku: 'SDC-AC-02', desc: 'Energy efficient window air conditioner with smart temperature control.', img: '/uploads/cat-ac.jpg' },
    { name: 'SDC Blizzard 2.0 Ton Inverter Split AC', price: 46999, sku: 'SDC-AC-03', desc: 'Heavy duty split AC for large rooms with PM 2.5 air purification filters.', img: '/uploads/cat-ac.jpg' }
  ],
  'earbuds': [
    { name: 'SDC BassBuds Pro Wireless Earbuds', price: 1499, sku: 'SDC-EL-EB1', desc: 'TWS earbuds with active noise cancellation, 40 hours battery life and IPX5.', img: '/uploads/cat-earbuds.jpg' },
    { name: 'SDC GamingBuds Ultra Low Latency', price: 1999, sku: 'SDC-EL-EB2', desc: 'TWS gaming earbuds with 40ms low latency mode, RGB lights and clear calling mic.', img: '/uploads/cat-earbuds.jpg' },
    { name: 'SDC AirTune Lite Wireless Earbuds', price: 999, sku: 'SDC-EL-EB3', desc: 'Lightweight bluetooth earbuds with fast charging and deep bass support.', img: '/uploads/cat-earbuds.jpg' }
  ],
  'neckbands': [
    { name: 'SDC NeckLoop Pro Wireless Headset', price: 999, sku: 'SDC-EL-NB1', desc: 'Magnetic neckband headphones with 30 hours playback, fast charge and dual pairing.', img: '/uploads/cat-neckbands.jpg' },
    { name: 'SDC SportRun Active Neckband', price: 1299, sku: 'SDC-EL-NB2', desc: 'IPX7 sweatproof sports neckband with super flexible silicon collar and HD sound.', img: '/uploads/cat-neckbands.jpg' },
    { name: 'SDC EchoBass Metal Neckband', price: 799, sku: 'SDC-EL-NB3', desc: 'Metallic body neckband earphones with passive noise isolation and deep bass.', img: '/uploads/cat-neckbands.jpg' }
  ],

  // Home & Decor
  'wall-clocks': [
    { name: 'SDC Traditional Wooden Wall Clock', price: 1599, sku: 'SDC-WC-01', desc: 'Handcrafted round analog wall clock in solid wood, vintage Roman numerals.', img: '/uploads/cat-clocks.jpg' },
    { name: 'SDC Modern Metal Peacock Clock', price: 3499, sku: 'SDC-WC-02', desc: 'Luxury decorative peacock shape wall clock with crystal rhinestones.', img: '/uploads/cat-clocks.jpg' },
    { name: 'SDC Classic Round Silent Wall Clock', price: 899, sku: 'SDC-WC-03', desc: 'Non-ticking bedroom and office wall clock with large numbers display.', img: '/uploads/cat-clocks.jpg' }
  ],
  'statues': [
    { name: 'SDC Brass Ganesha Idol', price: 2499, sku: 'SDC-ST-01d', desc: 'Artistic handcrafted brass idol of Lord Ganesha for temple and home decor.', img: '/uploads/statue-ganesha-1.jpg' },
    { name: 'SDC Meditating Buddha Statue', price: 1299, sku: 'SDC-ST-02d', desc: 'Premium stone-finish meditating Buddha figurine for peaceful home decor.', img: '/uploads/cat-decor.jpg' },
    { name: 'SDC Brass Pooja Diya Statue', price: 1899, sku: 'SDC-ST-03d', desc: 'Traditional brass statue stand with 5-wick oil lamp lamps.', img: '/uploads/statue-ganesha-1.jpg' }
  ],
  'flower-pots': [
    { name: 'SDC Ceramic Succulent Flower Pots', price: 799, sku: 'SDC-FP-01', desc: 'Set of 3 mini ceramic flower pots with bamboo trays, perfect for desk plants.', img: '/uploads/cat-flower-pots.jpg' },
    { name: 'SDC Golden Metallic Indoor Pot Stand', price: 1499, sku: 'SDC-FP-02', desc: 'Luxury iron planter pot stand with golden anti-rust finish coating.', img: '/uploads/cat-flower-pots.jpg' },
    { name: 'SDC Self-Watering Plastic Pot Set', price: 499, sku: 'SDC-FP-03', desc: 'Set of 5 plastic pots with self watering indicator holes for garden.', img: '/uploads/cat-flower-pots.jpg' }
  ],

  // Toys
  'electronic-toy-cars': [
    { name: 'SDC Remote Control Rechargeable SUV', price: 1899, sku: 'SDC-TY-RC1', desc: '4WD remote control off-road SUV toy car with rechargeable batteries.', img: '/uploads/cat-toy-cars.jpg' },
    { name: 'SDC Smart Sensor Gesture Toy Car', price: 2499, sku: 'SDC-TY-RC2', desc: 'Gesture control hand-sensor remote car with 360-degree rotation and music.', img: '/uploads/cat-toy-cars.jpg' },
    { name: 'SDC High Speed Racing Toy Car', price: 999, sku: 'SDC-TY-RC3', desc: 'Sleek sports racing toy car with realistic headlights and remote controller.', img: '/uploads/cat-toy-cars.jpg' }
  ],
  'electronic-kids-scooty': [
    { name: 'SDC Battery Powered Ride-On Scooter', price: 6999, sku: 'SDC-TY-SC1', desc: 'Electric ride-on kids scooter with 3 wheels, music, headlights and charging adapter.', img: '/uploads/cat-kids-scooty.jpg' },
    { name: 'SDC Foldable Kids Kick Scooty', price: 1999, sku: 'SDC-TY-SC2', desc: 'Adjustable height kids kick scooter with PU flashing light wheels.', img: '/uploads/cat-kids-scooty.jpg' },
    { name: 'SDC Electric Kids Balance Scooter', price: 8499, sku: 'SDC-TY-SC3', desc: 'Self-balancing smart hoverboard scooter for kids with bluetooth speakers.', img: '/uploads/cat-kids-scooty.jpg' }
  ],

  // Bicycle
  'bicycles': [
    { name: 'SDC Ranger 26T Mountain Bicycle', price: 7999, sku: 'SDC-BY-BC1', desc: 'Multi-gear mountain bicycle with front suspension, dual disc brakes and alloy wheels.', img: '/uploads/cat-bicycles.jpg' },
    { name: 'SDC CityRider Single Speed Bicycle', price: 5499, sku: 'SDC-BY-BC2', desc: 'Classic single speed hybrid city bicycle with front basket and rear carrier.', img: '/uploads/cat-bicycles.jpg' },
    { name: 'SDC Kids Sporty 16T Bicycle', price: 3499, sku: 'SDC-BY-BC3', desc: 'Kids cycle with training wheels, water bottle and chain guard, ages 4-7.', img: '/uploads/cat-bicycles.jpg' }
  ]
};

async function run() {
  try {
    const connection = await mysql.createConnection(dbConfig);
    console.log('Connected to MySQL server.');

    // 1. Temporarily disable foreign keys and wipe tables
    await connection.execute('SET FOREIGN_KEY_CHECKS = 0');
    await connection.execute('TRUNCATE TABLE product_images');
    await connection.execute('TRUNCATE TABLE products');
    await connection.execute('TRUNCATE TABLE categories');
    console.log('Cleaned old categories and products data.');

    // 2. Insert main categories and subcategories
    const categoryIds = {}; // Map slug to ID

    // First insert main parent categories (parent_id = NULL)
    const parents = categoriesSeed.filter(c => c.parentSlug === null);
    for (const parent of parents) {
      const [res] = await connection.execute(
        'INSERT INTO categories (name, slug, parent_id, image_url) VALUES (?, ?, NULL, ?)',
        [parent.name, parent.slug, parent.img]
      );
      categoryIds[parent.slug] = res.insertId;
      console.log(`Seeded main category: ${parent.name} (ID: ${res.insertId})`);
    }

    // Next insert subcategories
    const subs = categoriesSeed.filter(c => c.parentSlug !== null);
    for (const sub of subs) {
      const parentId = categoryIds[sub.parentSlug];
      const [res] = await connection.execute(
        'INSERT INTO categories (name, slug, parent_id, image_url) VALUES (?, ?, ?, ?)',
        [sub.name, sub.slug, parentId, sub.img]
      );
      categoryIds[sub.slug] = res.insertId;
      console.log(`Seeded subcategory: ${sub.name} under ${sub.parentSlug} (ID: ${res.insertId})`);
    }

    // 3. Seed Products for each subcategory
    const entries = Object.entries(productsSeed);
    for (const [subSlug, products] of entries) {
      const categoryId = categoryIds[subSlug];
      if (!categoryId) {
        console.warn(`Category slug ${subSlug} has no matching ID. Skipping.`);
        continue;
      }

      for (const prod of products) {
        // Insert product
        const [pRes] = await connection.execute(
          `INSERT INTO products (name, slug, description, price, stock, sku, category_id, brand_id, material_id, color_id, is_featured, is_best_seller, is_new_arrival, rating)
           VALUES (?, ?, ?, ?, 12, ?, ?, 1, 3, 5, 1, 1, 1, 4.80)`,
          [prod.name, prod.sku.toLowerCase(), prod.desc, prod.price, prod.sku, categoryId]
        );
        const productId = pRes.insertId;

        // Insert primary product image
        await connection.execute(
          'INSERT INTO product_images (product_id, image_url, is_primary) VALUES (?, ?, 1)',
          [productId, prod.img]
        );

        console.log(`Seeded product: ${prod.name} (SKU: ${prod.sku})`);
      }
    }

    // 4. Re-enable foreign key checks
    await connection.execute('SET FOREIGN_KEY_CHECKS = 1');
    await connection.end();
    console.log('Database categories and products fully re-seeded.');
  } catch (err) {
    console.error('Error during database re-seeding:', err.message);
  }
}

run();
