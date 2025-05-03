const { getAuth } = require('firebase-admin/auth');
const User = require('../models/User');

// Basic authentication middleware
const authMiddleware = async (req, res, next) => {
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  // Skip auth in development mode if configured to do so
  if (isDevelopment && process.env.SKIP_AUTH_IN_DEV === 'true') {
    console.warn('Auth check skipped in development mode');
    req.user = { role: 'admin' }; // Simulated admin for development
    return next();
  }

  try {
    const token = req.headers.authorization?.split('Bearer ')[1];
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized: No token provided' });
    }

    // Verify Firebase token
    const decodedToken = await getAuth().verifyIdToken(token);
    
    // Find user in our database
    const user = await User.findOne({ firebaseUid: decodedToken.uid });
    
    if (!user) {
      // User exists in Firebase but not in our database
      return res.status(403).json({ 
        error: 'User not registered in the system',
        code: 'USER_NOT_REGISTERED'
      });
    }
    
    // Add user data to request object
    req.user = user;
    req.firebaseUser = decodedToken;
    
    // Update last login time
    user.lastLogin = new Date();
    await user.save();
    
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(401).json({ error: 'Unauthorized: Invalid token' });
  }
};

// Role-based middleware
const requireRole = (roles) => {
  return (req, res, next) => {
    // Must be used after authMiddleware
    if (!req.user) {
      return res.status(500).json({ error: 'Server error: Auth middleware not applied' });
    }
    
    // Check if user has the required role
    if (Array.isArray(roles)) {
      if (!roles.includes(req.user.role)) {
        return res.status(403).json({ error: 'Forbidden: Insufficient permissions' });
      }
    } else {
      if (req.user.role !== roles) {
        return res.status(403).json({ error: 'Forbidden: Insufficient permissions' });
      }
    }
    
    next();
  };
};

// Specific role middlewares
const requireAdmin = requireRole('admin');
const requireAgent = requireRole(['admin', 'agent']);

module.exports = {
  authMiddleware,
  requireRole,
  requireAdmin,
  requireAgent
}; 