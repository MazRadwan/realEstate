require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const connectDB = require('../config/db');

// Function to create indexes on the User collection
async function createUserIndexes() {
  console.log('Creating indexes for User collection...');
  
  try {
    // Create indexes for frequently queried fields
    await User.collection.createIndex({ firebaseUid: 1 }, { unique: true });
    await User.collection.createIndex({ email: 1 }, { unique: true });
    await User.collection.createIndex({ role: 1 });
    
    console.log('User collection indexes created successfully');
  } catch (error) {
    console.error('Error creating User collection indexes:', error);
    throw error;
  }
}

// Function to create admin user if it doesn't exist
async function createAdminUser(firebaseUid, email) {
  console.log('Checking for admin user...');
  
  try {
    // Check if admin user exists
    const adminExists = await User.findOne({ role: 'admin' });
    
    if (adminExists) {
      console.log('Admin user already exists:', adminExists.email);
      return;
    }
    
    // Create admin user if one doesn't exist
    if (firebaseUid && email) {
      const adminUser = new User({
        firebaseUid,
        email,
        displayName: 'Admin',
        role: 'admin',
        createdAt: new Date()
      });
      
      await adminUser.save();
      console.log('Admin user created successfully:', email);
    } else {
      console.log('No admin user created. To create an admin user, provide Firebase UID and email.');
    }
  } catch (error) {
    console.error('Error creating admin user:', error);
    throw error;
  }
}

// Main function to initialize database
async function initDatabase() {
  console.log('Initializing database...');
  
  try {
    // Connect to MongoDB
    await connectDB();
    
    // Create User collection indexes
    await createUserIndexes();
    
    // Create admin user if one doesn't exist and credentials are provided
    // You would replace these values with actual Firebase UID and email
    const adminFirebaseUid = process.env.ADMIN_FIREBASE_UID;
    const adminEmail = process.env.ADMIN_EMAIL;
    
    if (adminFirebaseUid && adminEmail) {
      await createAdminUser(adminFirebaseUid, adminEmail);
    } else {
      console.log('No admin credentials provided in environment variables.');
      console.log('To create an admin user, set ADMIN_FIREBASE_UID and ADMIN_EMAIL in your .env file.');
    }
    
    console.log('Database initialization completed successfully');
  } catch (error) {
    console.error('Database initialization failed:', error);
  } finally {
    // Close the database connection
    mongoose.connection.close();
    console.log('Database connection closed');
  }
}

// Run the initialization
initDatabase(); 