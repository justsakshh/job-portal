const admin = require('firebase-admin');
require('dotenv').config();

// Initialize Firebase Admin. 
try {
  let credential;
  
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    // If provided as a string in environment variables
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    credential = admin.credential.cert(serviceAccount);
    console.log('Firebase Admin initialized from environment variable');
  } else {
    try {
      // Attempt to load from local file
      const serviceAccount = require('./serviceAccountKey.json');
      credential = admin.credential.cert(serviceAccount);
      console.log('Firebase Admin initialized with local serviceAccountKey.json');
    } catch (fileError) {
      // Final fallback to default credentials
      credential = admin.credential.applicationDefault();
      console.log('Firebase Admin initialized with default credentials');
    }
  }

  if (!admin.apps.length) {
    admin.initializeApp({
      credential,
      storageBucket: "job-portal-ea6fc.firebasestorage.app"
    });
  }
} catch (error) {
  console.error('Firebase Admin initialization failed:', error);
}

const db = admin.firestore();
const auth = admin.auth();
const storage = admin.storage();

module.exports = { admin, db, auth, storage };
