const { storage } = require('./config/firebaseAdmin');

async function configureCors() {
  // If no name is passed, it tries to use the default bucket from initializeApp
  const bucket = storage.bucket(); 
  
  console.log(`Attempting to set CORS for bucket: ${bucket.name || 'default'}...`);
  
  try {
    await bucket.setCorsConfiguration([
      {
        origin: ['*'],
        method: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        responseHeader: ['Content-Type', 'Authorization'],
        maxAgeSeconds: 3600
      }
    ]);
    console.log('✅ CORS configuration updated successfully!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error setting CORS:', err.message);
    console.log('\nTip: Please check your Firebase Console > Storage for the bucket name (starts with gs://) and paste it here!');
    process.exit(1);
  }
}

configureCors();
