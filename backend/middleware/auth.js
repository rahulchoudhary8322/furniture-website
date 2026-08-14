const admin = require('../config/firebaseAdmin');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET || 'sdc_canteen_jwt_secret_key_1998';

module.exports = async function(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ success: false, message: 'Access denied. No token token provided.' });
  }

  // If Firebase Admin is initialized, try validating Firebase token for admin
  if (admin.isInitialized()) {
    try {
      const decodedToken = await admin.auth().verifyIdToken(token);
      const db = require('../config/db');
      const [rows] = await db.query('SELECT id, username FROM admin_users WHERE username = ?', [decodedToken.email]);
      
      const adminEmailEnv = process.env.ADMIN_USERNAME || 'admin';
      
      if (rows.length > 0 || decodedToken.email === adminEmailEnv || decodedToken.email.split('@')[0] === adminEmailEnv) {
        req.admin = {
          id: rows[0]?.id || 1,
          username: rows[0]?.username || decodedToken.email,
          role: 'admin'
        };
        return next();
      } else {
        return res.status(403).json({ success: false, message: 'Access denied. Authorized admin role required.' });
      }
    } catch (firebaseError) {
      // Fall through to standard local JWT fallback
    }
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (decoded.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access denied. Admin role required.' });
    }
    req.admin = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ success: false, message: 'Invalid or expired token.' });
  }
};
