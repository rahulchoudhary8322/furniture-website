const admin = require('../config/firebaseAdmin');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET || 'sdc_canteen_jwt_secret_key_1998';

module.exports = async function(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ success: false, message: 'Access denied. No token provided.' });
  }

  // If Firebase Admin is initialized, try validating Firebase token
  if (admin.isInitialized()) {
    try {
      const decodedToken = await admin.auth().verifyIdToken(token);
      
      if (!decodedToken.email_verified) {
        return res.status(401).json({ success: false, message: 'Access denied. Email address not verified.' });
      }

      const db = require('../config/db');
      const [rows] = await db.query('SELECT id, username, email FROM users WHERE email = ?', [decodedToken.email]);
      
      if (rows.length > 0) {
        req.user = {
          id: rows[0].id,
          username: rows[0].username,
          email: decodedToken.email,
          role: 'customer'
        };
        return next();
      } else {
        req.user = {
          id: null,
          username: decodedToken.name || decodedToken.email.split('@')[0],
          email: decodedToken.email,
          role: 'customer',
          firebase_uid: decodedToken.uid
        };
        return next();
      }
    } catch (firebaseError) {
      // Fall through to standard local JWT fallback
    }
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (decoded.role !== 'customer') {
      return res.status(403).json({ success: false, message: 'Access denied. Customer role required.' });
    }
    req.user = decoded; // Contains id and username of the customer
    next();
  } catch (error) {
    return res.status(403).json({ success: false, message: 'Invalid or expired token.' });
  }
};
