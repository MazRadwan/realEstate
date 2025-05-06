const mongoose = require('mongoose');
require('dotenv').config();

// MongoDB Connection URI from environment variables
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('MONGODB_URI environment variable is not set - DB connections will fail');
  // Continue without exiting
}

// Connect to MongoDB
const connectDB = async () => {
  if (!MONGODB_URI) {
    console.error('Cannot connect to MongoDB: MONGODB_URI is not set');
    return Promise.resolve(null); // Return resolved promise to allow app to continue
  }
  
  try {
    // Log connection string (with password redacted)
    const connectionString = process.env.MONGODB_URI || '';
    const redactedUri = connectionString.replace(/\/\/([^:]+):([^@]+)@/, '//\$1:****@');
    console.log(`Attempting MongoDB connection to: ${redactedUri}`);
    
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      // These options may need adjustment based on your MongoDB version
      serverSelectionTimeoutMS: 5000, // Timeout after 5 seconds
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
    });
    
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (err) {
    console.error('MongoDB connection error:');
    console.error(`- Name: ${err.name}`);
    console.error(`- Message: ${err.message}`);
    console.error(`- Code: ${err.code || 'N/A'}`);
    
    // Continue without db connection
    return Promise.resolve(null); // Return resolved promise to allow app to continue
  }
};

// Handle connection events
mongoose.connection.on('connected', () => {
  console.log('Mongoose connected to DB');
});

mongoose.connection.on('error', (err) => {
  console.error(`Mongoose connection error: ${err}`);
});

mongoose.connection.on('disconnected', () => {
  console.log('Mongoose disconnected');
});

// Gracefully close the connection when the app terminates
process.on('SIGINT', async () => {
  if (mongoose.connection.readyState) {
    await mongoose.connection.close();
    console.log('Mongoose disconnected through app termination');
  }
  process.exit(0);
});

module.exports = connectDB; 