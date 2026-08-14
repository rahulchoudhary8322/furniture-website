const { initializeApp, cert, getApps } = require('firebase-admin');
const { getAuth } = require('firebase-admin/auth');
require('dotenv').config();

const projectId = process.env.FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
const privateKey = process.env.FIREBASE_PRIVATE_KEY;

let firebaseApp = null;
let authInstance = null;

if (projectId && clientEmail && privateKey) {
  try {
    const apps = getApps();
    if (apps.length === 0) {
      firebaseApp = initializeApp({
        credential: cert({
          projectId,
          clientEmail,
          privateKey: privateKey.replace(/\\n/g, '\n')
        })
      });
    } else {
      firebaseApp = apps[0];
    }
    authInstance = getAuth(firebaseApp);
    console.log('🔥 Firebase Admin SDK initialized successfully.');
  } catch (error) {
    console.error('❌ Firebase Admin SDK initialization failed:', error.message);
  }
} else {
  console.warn('⚠️ Firebase credentials missing in environment variables. Firebase Admin SDK not initialized.');
}

module.exports = {
  auth: () => authInstance,
  isInitialized: () => authInstance !== null
};
