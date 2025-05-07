require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { initializeApp, cert } = require('firebase-admin/app');
const connectDB = require('./config/db');
const mongoose = require('mongoose');

// Import middleware
const { authMiddleware, requireAdmin } = require('./middleware/auth');

// Routes
const mapboxRoutes = require('./routes/mapbox');
const authRoutes = require('./routes/auth');
const propertyRoutes = require('./routes/properties');

// Initialize Express
const app = express();
const PORT = process.env.PORT || 5001;
const isDevelopment = process.env.NODE_ENV === 'development';

// Connect to MongoDB
connectDB()
  .then(() => console.log('MongoDB connection initialized'))
  .catch(err => console.error('MongoDB connection error:', err));

// Middleware
app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://real-estate-frontend-jet.vercel.app'
  ],
  credentials: true
}));
app.use(express.json());

// Firebase Admin initialization
try {
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    const serviceAccountStr = process.env.FIREBASE_SERVICE_ACCOUNT;
    const serviceAccount = JSON.parse(serviceAccountStr);
    
    // Fix private key format if needed
    if (serviceAccount.private_key && serviceAccount.private_key.includes('\\n')) {
      serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');
    }
    
    initializeApp({
      credential: cert(serviceAccount)
    });
    console.log('Firebase Admin initialized successfully');
  } else {
    console.log('Firebase Service Account not found, auth verification disabled');
  }
} catch (error) {
  console.error('Error initializing Firebase Admin:', error);
}

// Routes
// In development, don't require authentication for some routes if configured
if (isDevelopment && process.env.SKIP_AUTH_IN_DEV === 'true') {
  app.use('/api/mapbox', mapboxRoutes);
  app.use('/api/properties', propertyRoutes);
  console.log('API routes accessible without authentication in development mode');
} else {
  app.use('/api/mapbox', authMiddleware, mapboxRoutes);
  app.use('/api/properties', authMiddleware, propertyRoutes);
}

app.use('/api/auth', authRoutes);
console.log('DEBUG: Mounted auth routes at /api/auth');

// Health check route
app.get('/api/health', async (req, res) => {
  let mongoStatus = 'unknown';
  
  // Test MongoDB connection
  try {
    if (mongoose.connection.readyState === 1) {
      mongoStatus = 'connected';
      // Try a simple query to validate access
      await mongoose.connection.db.admin().ping();
    } else {
      mongoStatus = `disconnected (readyState: ${mongoose.connection.readyState})`;
    }
  } catch (err) {
    console.error('MongoDB health check error:', err);
    mongoStatus = `error: ${err.message}`;
  }
  
  res.status(200).json({ 
    status: 'ok', 
    timestamp: new Date(), 
    mode: isDevelopment ? 'development' : 'production',
    services: {
      mongodb: mongoStatus,
      mapbox: process.env.MAPBOX_API_KEY ? 'configured' : 'missing',
      firebase: process.env.FIREBASE_SERVICE_ACCOUNT ? 'configured' : 'missing'
    },
    env: {
      mongodb_uri_set: !!process.env.MONGODB_URI,
      node_env: process.env.NODE_ENV || 'not set'
    }
  });
});

// Protected route example
app.get('/api/protected', authMiddleware, (req, res) => {
  res.json({ 
    message: 'This is a protected route', 
    user: {
      id: req.user._id,
      email: req.user.email,
      role: req.user.role
    }
  });
});

// Admin-only route example
app.get('/api/admin', authMiddleware, requireAdmin, (req, res) => {
  res.json({ 
    message: 'This is an admin-only route', 
    user: {
      id: req.user._id,
      email: req.user.email,
      role: req.user.role
    }
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT} in ${isDevelopment ? 'development' : 'production'} mode`);
}); 