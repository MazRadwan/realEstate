require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const connectDB = require('../config/db');

// Get email and UID from command line arguments
const email = process.argv[2];
const firebaseUid = process.argv[3];
if (!email || !firebaseUid) {
  console.error('Please provide an email address and Firebase UID:');
  console.error('node scripts/createAdminManually.js admin@example.com firebase-uid-12345');
  process.exit(1);
}

async function createAdminUserManually() {
  try {
    // Connect to MongoDB
    await connectDB();
    console.log('Connected to MongoDB');

    // Check if user exists in our database
    let user = await User.findOne({ $or: [{ firebaseUid }, { email }] });
    
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
        firebaseUid,
        email,
        displayName: 'Admin',
        role: 'admin',
        createdAt: new Date()
      });
      
      await user.save();
      console.log('Admin user created successfully in database');
    }
  } catch (error) {
    console.error('Error creating admin user:', error);
  } finally {
    // Close the database connection
    mongoose.connection.close();
    console.log('Database connection closed');
    process.exit(0);
  }
}

createAdminUserManually(); 