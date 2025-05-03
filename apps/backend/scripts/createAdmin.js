require('dotenv').config();
const { initializeApp, cert } = require('firebase-admin/app');
const { getAuth } = require('firebase-admin/auth');
const User = require('../models/User');
const connectDB = require('../config/db');

// Get email from command line arguments
const email = process.argv[2];
if (!email) {
  console.error('Please provide an email address: node scripts/createAdmin.js admin@example.com');
  process.exit(1);
}

// Initialize Firebase Admin if not already initialized
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

async function createAdminUser() {
  try {
    // Connect to MongoDB
    await connectDB();
    console.log('Connected to MongoDB');

    // Check if user with this email already exists in Firebase
    try {
      const userRecord = await getAuth().getUserByEmail(email);
      console.log('Found existing Firebase user:', userRecord.uid);
      
      // Check if user exists in our database
      let user = await User.findOne({ firebaseUid: userRecord.uid });
      
      if (user) {
        console.log('User already exists in database:', user.email);
        
        // If user exists but is not an admin, make them an admin
        if (user.role !== 'admin') {
          user.role = 'admin';
          await user.save();
          console.log('User updated to admin role');
        } else {
          console.log('User is already an admin');
        }
      } else {
        // Create new user in MongoDB with admin role
        user = new User({
          firebaseUid: userRecord.uid,
          email: userRecord.email,
          displayName: userRecord.displayName || 'Admin',
          photoURL: userRecord.photoURL,
          role: 'admin',
          createdAt: new Date()
        });
        
        await user.save();
        console.log('Admin user created successfully in database');
      }
      
    } catch (error) {
      if (error.code === 'auth/user-not-found') {
        console.error('User does not exist in Firebase. Please create the user in Firebase first.');
      } else {
        console.error('Error getting user from Firebase:', error);
      }
      process.exit(1);
    }
    
  } catch (error) {
    console.error('Error creating admin user:', error);
  } finally {
    // Close the database connection
    require('mongoose').connection.close();
    console.log('Database connection closed');
    process.exit(0);
  }
}

createAdminUser(); 