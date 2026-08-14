// Force nodemon reload to read updated .env changes
const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const { initializeDatabase } = require('./config/db');

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS for frontend requests
const allowedOrigins = process.env.FRONTEND_URL || '*';
app.use(cors({
  origin: allowedOrigins,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parsing middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static uploaded files (product images, banners)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Register API Routes
app.use('/api/admin', require('./routes/admin'));
app.use('/api/categories', require('./routes/categories'));
app.use('/api/products', require('./routes/products'));
app.use('/api/attributes', require('./routes/attributes'));
app.use('/api/ai', require('./routes/ai'));
app.use('/api/user', require('./routes/user'));
app.use('/api/wishlist', require('./routes/wishlist'));
app.use('/api/orders', require('./routes/orders'));

// Basic health check route
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date() });
});

// Start server after initializing the database
async function startServer() {
  await initializeDatabase();
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Backend API Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
