require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const connectDB = require('../config/db');

/**
 * This script tests RBAC by checking users in the database and their roles
 */

async function testRBAC() {
  try {
    // Connect to MongoDB
    await connectDB();
    console.log('Connected to MongoDB');

    // Check for admin users
    const adminUsers = await User.find({ role: 'admin' });
    console.log(`Found ${adminUsers.length} admin users:`);
    
    adminUsers.forEach(user => {
      console.log(`- ${user.email} (${user.firebaseUid})`);
    });
    
    // Check for regular users
    const regularUsers = await User.find({ role: 'user' });
    console.log(`\nFound ${regularUsers.length} regular users:`);
    
    regularUsers.slice(0, 5).forEach(user => {
      console.log(`- ${user.email} (${user.firebaseUid})`);
    });
    
    if (regularUsers.length > 5) {
      console.log(`  ...and ${regularUsers.length - 5} more`);
    }
    
    // Display RBAC functionality summary
    console.log('\n=== RBAC System Summary ===');
    console.log('Your system has the following roles:');
    console.log('1. admin - Full access to all routes and features');
    console.log('2. user - Access to regular user features only');
    
    console.log('\nProtected routes:');
    console.log('- /api/protected - Accessible by any authenticated user');
    console.log('- /api/admin - Accessible only by admin users');
    console.log('- /api/auth/users - User management (admin only)');
    console.log('- /api/auth/users/:userId/role - Role management (admin only)');
    
    console.log('\nTo test your RBAC system:');
    console.log('1. Sign in as a regular user and try to access admin routes - should be denied');
    console.log('2. Sign in as an admin user and access all routes - should be allowed');
    console.log('3. With admin account, try changing another user\'s role');
    
  } catch (error) {
    console.error('Error testing RBAC:', error);
  } finally {
    // Close the database connection
    mongoose.connection.close();
    console.log('\nDatabase connection closed');
  }
}

testRBAC(); 