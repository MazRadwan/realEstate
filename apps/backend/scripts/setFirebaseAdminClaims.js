require('dotenv').config();
const { initializeApp, cert } = require('firebase-admin/app');
const { getAuth } = require('firebase-admin/auth');

// Get UID from command line arguments or environment
const uid = process.argv[2] || process.env.ADMIN_FIREBASE_UID;

if (!uid) {
  console.error('Please provide a Firebase UID as an argument or set ADMIN_FIREBASE_UID in .env');
  console.error('Usage: node scripts/setFirebaseAdminClaims.js <firebase-uid>');
  process.exit(1);
}

// Initialize Firebase Admin
let firebaseAdmin;
try {
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    firebaseAdmin = initializeApp({
      credential: cert(serviceAccount)
    });
    console.log('Firebase Admin initialized successfully');
  } else {
    console.error('Firebase Service Account not found in environment variables');
    process.exit(1);
  }
} catch (error) {
  console.error('Error initializing Firebase Admin:', error);
  process.exit(1);
}

async function setAdminClaims() {
  try {
    // Set custom claims on the user
    await getAuth().setCustomUserClaims(uid, { 
      admin: true,
      role: 'admin'
    });
    
    // Verify the claims were set correctly
    const userRecord = await getAuth().getUser(uid);
    console.log('Successfully set admin claims for user:', userRecord.email);
    console.log('Custom claims:', userRecord.customClaims);
    
    // Force token refresh is needed on the client side after this operation
    console.log('\nNOTE: The user will need to sign out and sign in again for claims to take effect');
    
  } catch (error) {
    console.error('Error setting admin claims:', error);
  }
  
  process.exit(0);
}

setAdminClaims(); 