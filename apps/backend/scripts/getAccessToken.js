require('dotenv').config();
const { initializeApp, cert } = require('firebase-admin/app');
const { getAuth } = require('firebase-admin/auth');

async function getAccessToken() {
  try {
    // Parse the service account JSON
    if (!process.env.FIREBASE_SERVICE_ACCOUNT) {
      console.error('Error: FIREBASE_SERVICE_ACCOUNT environment variable not found');
      process.exit(1);
    }

    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    
    // Initialize the app
    const app = initializeApp({
      credential: cert(serviceAccount)
    });
    
    console.log('Firebase Admin initialized successfully');
    
    // Get the access token
    const token = await getAuth().createCustomToken('temp-user');
    console.log('\nAccess Token:');
    console.log(token);
    console.log('\nUse this token for API requests to Firebase Admin API');
    
  } catch (error) {
    console.error('Error getting access token:', error);
  }
  
  process.exit(0);
}

getAccessToken(); 