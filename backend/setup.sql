-- SDC Furniture & Electronic Canteen Database Setup

-- Create Database if not exists
-- CREATE DATABASE IF NOT EXISTS sdc_canteen;
-- USE sdc_canteen;

-- 1. Admin Users
CREATE TABLE IF NOT EXISTS admin_users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Categories (Support multi-level hierarchy with parent_id)
CREATE TABLE IF NOT EXISTS categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) NOT NULL UNIQUE,
  parent_id INT DEFAULT NULL,
  image_url VARCHAR(255) DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (parent_id) REFERENCES categories(id) ON DELETE CASCADE
);

-- 3. Brands
CREATE TABLE IF NOT EXISTS brands (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) NOT NULL UNIQUE
);

-- 4. Materials
CREATE TABLE IF NOT EXISTS materials (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) NOT NULL UNIQUE
);

-- 5. Colors
CREATE TABLE IF NOT EXISTS colors (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(50) NOT NULL,
  code VARCHAR(10) NOT NULL -- Hex code
);

-- 6. Products
CREATE TABLE IF NOT EXISTS products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  description TEXT NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  sale_price DECIMAL(10, 2) DEFAULT NULL,
  stock INT NOT NULL DEFAULT 0,
  sku VARCHAR(50) NOT NULL UNIQUE,
  category_id INT NOT NULL,
  brand_id INT DEFAULT NULL,
  material_id INT DEFAULT NULL,
  color_id INT DEFAULT NULL,
  is_featured BOOLEAN DEFAULT FALSE,
  is_best_seller BOOLEAN DEFAULT FALSE,
  is_new_arrival BOOLEAN DEFAULT FALSE,
  is_available BOOLEAN DEFAULT TRUE,
  rating DECIMAL(3, 2) DEFAULT 5.00,
  warranty VARCHAR(100) DEFAULT '1 Year Warranty',
  specifications TEXT, -- JSON or string list
  features TEXT, -- JSON or string list
  delivery_info VARCHAR(255) DEFAULT 'Estimated delivery: 3-7 business days',
  aplus_content TEXT DEFAULT NULL,
  amazon_link TEXT DEFAULT NULL,
  flipkart_link TEXT DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE,
  FOREIGN KEY (brand_id) REFERENCES brands(id) ON DELETE SET NULL,
  FOREIGN KEY (material_id) REFERENCES materials(id) ON DELETE SET NULL,
  FOREIGN KEY (color_id) REFERENCES colors(id) ON DELETE SET NULL
);

-- 7. Product Images
CREATE TABLE IF NOT EXISTS product_images (
  id INT AUTO_INCREMENT PRIMARY KEY,
  product_id INT NOT NULL,
  image_url VARCHAR(255) NOT NULL,
  is_primary BOOLEAN DEFAULT FALSE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- 8. Customer Reviews
CREATE TABLE IF NOT EXISTS reviews (
  id INT AUTO_INCREMENT PRIMARY KEY,
  product_id INT NOT NULL,
  customer_name VARCHAR(100) NOT NULL,
  rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment TEXT NOT NULL,
  is_approved BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- 8.5. Customers/Users
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

-- 8.6. Wishlist Items (Database Persistence)
CREATE TABLE IF NOT EXISTS wishlist_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  product_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  UNIQUE KEY unique_user_product (user_id, product_id)
);

-- 9. Dynamic Banners
CREATE TABLE IF NOT EXISTS banners (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  subtitle VARCHAR(255) DEFAULT NULL,
  image_url VARCHAR(255) NOT NULL,
  link VARCHAR(255) DEFAULT '/',
  is_active BOOLEAN DEFAULT TRUE
);

-- 10. Contact Details
CREATE TABLE IF NOT EXISTS contact_details (
  id INT AUTO_INCREMENT PRIMARY KEY,
  phone VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL,
  address TEXT NOT NULL,
  working_hours VARCHAR(100) NOT NULL,
  whatsapp VARCHAR(100) NOT NULL
);

-- 11. SEO Metadata
CREATE TABLE IF NOT EXISTS seo_metadata (
  id INT AUTO_INCREMENT PRIMARY KEY,
  page_name VARCHAR(100) NOT NULL UNIQUE,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  keywords TEXT NOT NULL
);

-- Seed Data Section
-- Seed Brands
INSERT IGNORE INTO brands (id, name, slug) VALUES
(1, 'SDC Premium', 'sdc-premium'),
(2, 'Samsung', 'samsung'),
(3, 'LG', 'lg'),
(4, 'Sony', 'sony'),
(5, 'Sleepwell', 'sleepwell'),
(6, 'Royaloak Style', 'royaloak-style');

-- Seed Materials
INSERT IGNORE INTO materials (id, name, slug) VALUES
(1, 'Fabric', 'fabric'),
(2, 'Genuine Leather', 'genuine-leather'),
(3, 'Teak Wood', 'teak-wood'),
(4, 'Sheesham Wood', 'sheesham-wood'),
(5, 'Metal', 'metal'),
(6, 'Plastic', 'plastic');

-- Seed Colors
INSERT IGNORE INTO colors (id, name, code) VALUES
(1, 'Dark Forest Green', '#0A2A1B'),
(2, 'Warm Amber', '#D49B28'),
(3, 'Charcoal Gray', '#333333'),
(4, 'Royal Blue', '#1A365D'),
(5, 'Classic Brown', '#5C4033'),
(6, 'Beige', '#F5F5DC');

-- Seed Main Categories
INSERT IGNORE INTO categories (id, name, slug, parent_id, image_url) VALUES
(1, 'Furniture', 'furniture', NULL, '/uploads/cat-furniture.jpg'),
(2, 'Electronics', 'electronics', NULL, '/uploads/cat-electronics.jpg'),
(3, 'Home & Decor', 'home-decor', NULL, '/uploads/cat-decor.jpg'),
(4, 'Toys', 'toys', NULL, '/uploads/cat-toys.jpg');

-- Seed Subcategories (Level 2)
INSERT IGNORE INTO categories (id, name, slug, parent_id, image_url) VALUES
(5, 'Recliners', 'recliners', 1, '/uploads/cat-recliners.jpg'),
(6, 'Sofa Sets', 'sofa-sets', 1, '/uploads/cat-sofas.jpg'),
(7, 'Dining Tables', 'dining-tables', 1, '/uploads/cat-dining.jpg'),
(8, 'Beds', 'beds', 1, '/uploads/cat-beds.jpg'),
(9, 'LED TVs', 'led-tvs', 2, '/uploads/cat-tvs.jpg'),
(10, 'Air Conditioners', 'air-conditioners', 2, '/uploads/cat-ac.jpg'),
(11, 'Refrigerators', 'refrigerators', 2, '/uploads/cat-refrigerators.jpg'),
(12, 'Mobile Phones', 'mobile-phones', 2, '/uploads/cat-mobiles.jpg'),
(13, 'God Statues', 'god-statues', 3, '/uploads/cat-statues.jpg'),
(14, 'Wall Clocks', 'wall-clocks', 3, '/uploads/cat-clocks.jpg'),
(15, 'Kids Toys', 'kids-toys', 4, '/uploads/cat-kids-toys.jpg'),
(16, 'Educational Toys', 'educational-toys', 4, '/uploads/cat-edu-toys.jpg');

-- Seed Sub-subcategories (Level 3) for Recliners, Sofa Sets, Dining Tables
INSERT IGNORE INTO categories (id, name, slug, parent_id, image_url) VALUES
(17, 'Fabric Recliners', 'fabric-recliners', 5, '/uploads/cat-fabric-recliners.jpg'),
(18, 'Leather Recliners', 'leather-recliners', 5, '/uploads/cat-leather-recliners.jpg'),
(19, 'Fabric Sofa', 'fabric-sofa', 6, '/uploads/cat-fabric-sofa.jpg'),
(20, 'Leather Sofa', 'leather-sofa', 6, '/uploads/cat-leather-sofa.jpg'),
(21, 'Wooden Sofa', 'wooden-sofa', 6, '/uploads/cat-wooden-sofa.jpg'),
(22, 'L Shape Sofa', 'l-shape-sofa', 6, '/uploads/cat-l-shape-sofa.jpg'),
(23, 'Corner Sofa', 'corner-sofa', 6, '/uploads/cat-corner-sofa.jpg'),
(24, '4 Seater Dining', '4-seater-dining', 7, '/uploads/cat-4-seater.jpg'),
(25, '6 Seater Dining', '6-seater-dining', 7, '/uploads/cat-6-seater.jpg'),
(26, '8 Seater Dining', '8-seater-dining', 7, '/uploads/cat-8-seater.jpg');

-- Seed Contact Details (using exact business information)
INSERT IGNORE INTO contact_details (id, phone, email, address, working_hours, whatsapp) VALUES
(1, '+91 9982827751, +91 9950105100, +91 8690787751', 'anjanamobile7751@gmail.com', 'Near Balaji Goshala, Salasar Ke Samne, Sujangarh Road, Salasar, Churu, Rajasthan – 331506', 'Monday – Sunday 10:00 AM – 5:00 PM', '9982827751');

-- Seed SEO Metadata
INSERT IGNORE INTO seo_metadata (id, page_name, title, description, keywords) VALUES
('1', 'home', 'SDC Furniture & Electronic Canteen - Premium Furniture & Electronics in Rajasthan', 'Trusted since 1998, SDC Furniture & Electronic Canteen provides premium quality home furniture, sofa sets, LED TVs, air conditioners, mobile phones, toys and home decor products in Salasar, Rajasthan.', 'SDC Canteen, SDC Furniture Salasar, SDC Electronics, Best furniture shop in Salasar, premium recliners, sofa sets Salasar'),
('2', 'about', 'About Us - SDC Furniture & Electronic Canteen', 'Learn about our journey since 1998 in delivering high-quality products including custom manufactured furniture, premium electronics, and appliances across Rajasthan.', 'SDC Canteen history, furniture manufacturer Rajasthan, trusted electronic shop since 1998'),
('3', 'contact', 'Contact Us - SDC Furniture & Electronic Canteen', 'Get in touch with SDC Furniture & Electronic Canteen. Located near Balaji Goshala, Salasar. Call +91 9982827751 for details and bulk order requests.', 'SDC contact number, Salasar furniture showroom address, SDC WhatsApp support'),
('4', 'services', 'Our Services - SDC Furniture & Electronic Canteen', 'Explore our wide range of services including custom furniture manufacturing, electronics supply, installation and repair support, and fast delivery.', 'furniture customization Rajasthan, electronics installation support, SDC appliance repair');

-- Seed Banners
INSERT IGNORE INTO banners (id, title, subtitle, image_url, link, is_active) VALUES
(1, 'Premium Recliners & Sofa Sets', 'Experience Ultimate Comfort with 15+ Years of Manufacturing Expertise', '/uploads/banner-1.jpg', '/category/recliners', 1),
(2, 'Latest Smart LED TVs & Home Appliances', 'Upgrade Your Home with Genuine Products & GST Billing Support', '/uploads/banner-2.jpg', '/category/electronics', 1);

-- Seed Products
-- 1. Recliner (Fabric)
INSERT IGNORE INTO products (id, name, slug, description, price, sale_price, stock, sku, category_id, brand_id, material_id, color_id, is_featured, is_best_seller, is_new_arrival, is_available, rating, warranty, specifications, features, delivery_info) VALUES
(1, 'SDC Royal Fabric Manual Recliner', 'sdc-royal-fabric-manual-recliner', 'Enjoy superior relaxation with our manual reclining chair upholstered in premium breathable fabric. Manufactured in-house using high-density foam, heavy-duty metal mechanism, and robust solid wood frame. Perfect for living rooms, bedrooms, or media rooms.', 24999.00, 18500.00, 15, 'FUR-REC-FAB-001', 17, 1, 1, 6, 1, 1, 0, 1, 4.8, '3 Years Warranty on Recliner Mechanism, 1 Year on Frame', '{"Frame Material": "Solid Wood & Metal", "Upholstery": "High-Quality Fabric", "Recliner Mechanism": "Manual Pull Tab", "Foam Density": "32 Density High Resilience", "Weight Capacity": "120 kg"}', '["Single-seater manual reclining comfort", "Three recline positions for reading, TV watching, and napping", "Thickly padded armrests and back cushion", "Easy assembly in minutes", "Durable mechanism tested for 10,000 cycles"]', 'Fast Home Delivery across Salasar & Rajasthan (Est. 3-5 days)');

-- 2. Recliner (Leather)
INSERT IGNORE INTO products (id, name, slug, description, price, sale_price, stock, sku, category_id, brand_id, material_id, color_id, is_featured, is_best_seller, is_new_arrival, is_available, rating, warranty, specifications, features, delivery_info) VALUES
(2, 'SDC Majestic Italian Leatherette Rocking Recliner', 'sdc-majestic-leatherette-recliner', 'Indulge in premium comfort with this rocking recliner chair wrapped in breathable leatherette. Features smooth rock and glider movements along with an easy-to-use manual recline system. Thick padded headrest and lumbar support ensure ergonomic seating.', 34999.00, 27999.00, 8, 'FUR-REC-LEA-002', 18, 1, 2, 5, 1, 0, 1, 1, 4.9, '5 Years Warranty on Frame, 1 Year on Leatherette & Mechanism', '{"Frame Material": "Solid Wood", "Reclining Mechanism": "Manual Handle", "Upholstery": "Premium Air-Leatherette", "Filling": "Pocket Spring + Premium Foam", "Functions": "360 Rocking & Reclining"}', '["Smooth glider-rocking base", "Ergonomic high-back design with supportive head pillow", "Stain-resistant and easy-to-clean leatherette", "Steel-reinforced frame for safety", "Premium luxury finish"]', 'Fast Home Delivery across Salasar & Rajasthan (Est. 3-5 days)');

-- 3. Sofa (Fabric L-Shape)
INSERT IGNORE INTO products (id, name, slug, description, price, sale_price, stock, sku, category_id, brand_id, material_id, color_id, is_featured, is_best_seller, is_new_arrival, is_available, rating, warranty, specifications, features, delivery_info) VALUES
(3, 'SDC Cozy 5-Seater L-Shape Fabric Sofa Set', 'sdc-cozy-l-shape-fabric-sofa', 'This L-shape corner sofa set is manufactured to elevate your living room aesthetics. Features premium upholstery in a rich dark forest green fabric, solid sheesham wood support, and fluffy fiber-filled cushions. Reversible lounge design adapts to your room layout.', 49999.00, 39999.00, 6, 'FUR-SOF-FAB-003', 22, 1, 1, 1, 0, 1, 0, 1, 4.7, '3 Years Warranty on Wood and Foam Frame', '{"Configuration": "L-Shape 5 Seater", "Frame": "Teak Wood structure", "Foam": "Super Soft 40-density Foam", "Fabric": "Premium Polyester Blend", "Legs": "Anti-scratch Wooden Legs"}', '["Spacious L-shape seating with reversible lounger", "Plush cushions for modern comfortable look", "Made with seasoned and treated solid wood structure", "Eco-friendly fabric with soft hand feel", "Includes 3 designer accent pillows"]', 'Free installation and doorstep delivery (Est. 5-7 days)');

-- 4. Sofa (Wooden Teak)
INSERT IGNORE INTO products (id, name, slug, description, price, sale_price, stock, sku, category_id, brand_id, material_id, color_id, is_featured, is_best_seller, is_new_arrival, is_available, rating, warranty, specifications, features, delivery_info) VALUES
(4, 'SDC Traditional 3+1+1 Teak Wood Sofa Set', 'sdc-traditional-teak-wood-sofa', 'Grace your home with the timeless elegance of hand-carved Teak Wood. This 5-seater sofa set (3-seater + 2 single chairs) features intricate carving details, warm walnut polish, and detachable premium fabric seat cushions. Built to last generations.', 59999.00, 48000.00, 4, 'FUR-SOF-WD-004', 21, 1, 3, 5, 1, 1, 0, 1, 5.0, 'Life-time Warranty against Termites, 1 Year on Polish', '{"Wood Type": "A-Grade Teak Wood (Sagwan)", "Seating Capacity": "5 Seating (3+1+1)", "Polish Type": "Melamine Matte Walnut", "Cushion": "Premium High-Density Detachable"}', '["Exquisite hand-carved details by master artisans", "Extremely durable Solid Teak Wood structure", "Detachable seat and back cushions for easy wash", "Anti-termite treated wood", "Classic royal Indian styling"]', 'Free delivery & installation by professional carpenter (Est. 7-10 days)');

-- 5. Dining Table (6 Seater)
INSERT IGNORE INTO products (id, name, slug, description, price, sale_price, stock, sku, category_id, brand_id, material_id, color_id, is_featured, is_best_seller, is_new_arrival, is_available, rating, warranty, specifications, features, delivery_info) VALUES
(5, 'SDC Solid Wood 6-Seater Dining Table Set', 'sdc-solid-wood-6-seater-dining', 'A gorgeous solid Sheesham wood dining table set complete with 6 matching upholstered chairs. Features a clean minimalistic layout with a smooth rectangular tabletop and ergonomically designed dining chairs for comfortable long family dinners.', 39999.00, 31999.00, 5, 'FUR-DIN-WD-005', 25, 1, 4, 5, 0, 0, 1, 1, 4.6, '2 Years Warranty on Sheesham Wood Structure', '{"Table Material": "Premium Sheesham Wood", "Chair Upholstery": "Beige Cushion Fabric", "Seating Capacity": "6 Persons", "Polish Finish": "Natural Honey Polish"}', '["Crafted from high-grade seasoned Sheesham Wood", "Sturdy dining table with thick legs for stability", "Chairs with high backs and soft fabric cushioning", "Scratch-resistant polish coating", "Minimalist modern dining style"]', 'Doorstep delivery and professional installation included (Est. 5-7 days)');

-- 6. LED TV (Samsung 55")
INSERT IGNORE INTO products (id, name, slug, description, price, sale_price, stock, sku, category_id, brand_id, material_id, color_id, is_featured, is_best_seller, is_new_arrival, is_available, rating, warranty, specifications, features, delivery_info) VALUES
(6, 'Samsung Crystal 4K Ultra HD Smart LED TV (55 inch)', 'samsung-55-crystal-4k-smart-tv', 'Enjoy billions of colors with the Samsung Crystal 4K UHD Smart TV. Features a sleek, bezel-less design, PurColor, Crystal Processor 4K, Smart Hub, and support for all your favorite streaming services (Netflix, Prime Video, YouTube). Full GST billing.', 54900.00, 43900.00, 10, 'ELE-TV-SAM-006', 9, 2, 5, 3, 1, 1, 0, 1, 4.8, '1 Year Comprehensive + 1 Year Additional on Panel Warranty', '{"Display Size": "55 Inches", "Resolution": "3840 x 2160 (4K)", "Refresh Rate": "60 Hz", "Smart OS": "Tizen Smart TV", "Connectivity": "3 HDMI, 2 USB, WiFi, Bluetooth"}', '["Crystal Processor 4K for spectacular color and depth", "Bezel-less PurColor display panel", "Q-Symphony sound compatibility", "Voice Assistants integrated (Alexa, Google Assistant)", "Screen mirroring and Apple AirPlay 2 support"]', 'Fast Home Delivery & Brand Authorized Wall Mount/Installation (Est. 2-3 days)');

-- 7. Refrigerators (LG Double Door)
INSERT IGNORE INTO products (id, name, slug, description, price, sale_price, stock, sku, category_id, brand_id, material_id, color_id, is_featured, is_best_seller, is_new_arrival, is_available, rating, warranty, specifications, features, delivery_info) VALUES
(7, 'LG 242L 3-Star Smart Inverter Double Door Refrigerator', 'lg-242l-double-door-refrigerator', 'Keep your food fresh longer with LG’s Smart Inverter Refrigerator. Featuring Door Cooling+, Multi Air Flow, Auto Smart Connect, and Moist \'N\' Fresh lattice box cover. Runs efficiently on your home inverter.', 32990.00, 26490.00, 12, 'ELE-REF-LG-007', 11, 3, 5, 3, 0, 1, 1, 1, 4.5, '1 Year Comprehensive + 10 Years on Smart Inverter Compressor', '{"Capacity": "242 Liters", "Energy Rating": "3 Star", "Compressor": "Smart Inverter Compressor", "Cooling Technology": "Door Cooling+ & Multi Air Flow", "Shelves": "Toughened Glass Shelves"}', '["Smart Inverter Compressor saves up to 48% energy", "Door Cooling+ delivers faster cooling in doors", "Smart Diagnosis for easy troubleshooting", "Auto Smart Connect connects to home inverter", "Stabilizer Free operation range 100V - 290V"]', 'Safe and secured delivery. Free demo by LG engineer upon arrival (Est. 2-4 days)');

-- 8. God Statue (Ganesha)
INSERT IGNORE INTO products (id, name, slug, description, price, sale_price, stock, sku, category_id, brand_id, material_id, color_id, is_featured, is_best_seller, is_new_arrival, is_available, rating, warranty, specifications, features, delivery_info) VALUES
(8, 'SDC Handcrafted Brass Ganesha Idol for Mandir', 'sdc-brass-ganesha-idol', 'Bring prosperity and positivity to your home with this beautiful handcrafted Brass Lord Ganesha Idol. Ideal for your home mandir, office desk, or as a premium gift item for festivals and housewarming ceremonies. Finished with golden antique details.', 4999.00, 2999.00, 20, 'DEC-STA-BRS-008', 13, 1, 5, 2, 0, 0, 1, 1, 4.9, '10 Years Finish and Shine Warranty', '{"Material": "Premium Solid Brass", "Height": "12 Inches", "Weight": "4.2 kg", "Finish": "Antique Gold Lacquered Polish", "Use Case": "Home Decor, Pooja Mandir"}', '["Hand-molded by local artisans in Rajasthan", "Fine craftsmanship with intricate carvings", "Rust-proof and long-lasting metallic shine", "Heavy solid brass base for stable placement", "Exquisite spiritual home decorative asset"]', 'Packaged in a premium cushioned gift box. Shipped in 24 hours (Est. 3-5 days)');

-- 9. Kids Educational Toy
INSERT IGNORE INTO products (id, name, slug, description, price, sale_price, stock, sku, category_id, brand_id, material_id, color_id, is_featured, is_best_seller, is_new_arrival, is_available, rating, warranty, specifications, features, delivery_info) VALUES
(9, 'SDC Wooden Intelligence Learning Building Blocks', 'sdc-wooden-learning-blocks', 'Spark creativity and cognitive thinking in your child with this set of 50 multi-colored wooden building blocks. Made with premium solid wood and non-toxic water-based paints. Safe, educational, and fun for children aged 2-6 years.', 1499.00, 999.00, 35, 'TOY-EDU-WD-009', 16, 1, 3, 2, 0, 0, 0, 1, 4.7, 'Replacement Warranty on transit damage', '{"Material": "Natural Pine Wood", "Piece Count": "50 Pieces", "Paint": "100% Non-Toxic Water-Based Paint", "Recommended Age": "2 to 6 Years", "Certifications": "EN71 Safe Toy Standard"}', '["Enhances motor skills and spatial coordination", "Includes sorting tray for easy packing", "Rounded corners and smooth surfaces for child safety", "Vibrant colors teach shape and color recognition", "Supports creative open-ended gameplay"]', 'Packed in eco-friendly storage bag. Dispatched in 1-2 days (Est. 3-5 days)');


-- Seed Product Images
INSERT IGNORE INTO product_images (id, product_id, image_url, is_primary) VALUES
(1, 1, '/uploads/recline-fab-1.jpg', 1),
(2, 1, '/uploads/recline-fab-2.jpg', 0),
(3, 2, '/uploads/recline-lea-1.jpg', 1),
(4, 2, '/uploads/recline-lea-2.jpg', 0),
(5, 3, '/uploads/sofa-lshape-1.jpg', 1),
(6, 3, '/uploads/sofa-lshape-2.jpg', 0),
(7, 4, '/uploads/sofa-wood-1.jpg', 1),
(8, 4, '/uploads/sofa-wood-2.jpg', 0),
(9, 5, '/uploads/dining-6s-1.jpg', 1),
(10, 5, '/uploads/dining-6s-2.jpg', 0),
(11, 6, '/uploads/tv-samsung-1.jpg', 1),
(12, 6, '/uploads/tv-samsung-2.jpg', 0),
(13, 7, '/uploads/ref-lg-1.jpg', 1),
(14, 7, '/uploads/ref-lg-2.jpg', 0),
(15, 8, '/uploads/statue-ganesha-1.jpg', 1),
(16, 9, '/uploads/toy-blocks-1.jpg', 1);


-- Seed Sample Reviews
INSERT IGNORE INTO reviews (id, product_id, customer_name, rating, comment, is_approved) VALUES
(1, 1, 'Rahul Sharma (Salasar)', 5, 'Bhaiya, bahut hi badhiya recliner hai! Back support ekdum gazab hai, aur fabric quality bahut smooth hai. Highly recommended!', 1),
(2, 1, 'Priya Vyas (Sujangarh)', 4, 'Very comfortable chair, SDC delivery team did a fast job and set it up nicely in my bedroom. Value for money.', 1),
(3, 4, 'Mahendra Singh (Jaipur)', 5, 'Superb wooden carving! Authentic teak wood used. Fully satisfied with the quality billing and installation team.', 1),
(4, 6, 'Rakesh Kumar (Churu)', 5, 'Got genuine Samsung TV with GST bill. SDC got the installation done within 24 hours of delivery. Highly trusted store since years!', 1);

-- 12. Orders
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

-- 13. Order Items
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

