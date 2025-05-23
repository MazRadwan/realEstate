const express = require('express');
const { getAuth } = require('firebase-admin/auth');
const User = require('../models/User');
const { authMiddleware, requireAdmin } = require('../middleware/auth');
const router = express.Router();

// Register a new user
router.post('/register', async (req, res) => {
  // DEBUG: Log incoming registration request
  console.log('DEBUG: Registration request received');
  console.log('DEBUG: Authorization header present:', !!req.headers.authorization);
  
  try {
    // Verify the Firebase token
    const token = req.headers.authorization?.split('Bearer ')[1];
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    console.log('DEBUG: Token extracted, verifying with Firebase...');
    let decodedToken;
    try {
      decodedToken = await getAuth().verifyIdToken(token);
      console.log('DEBUG: Token verified successfully');
    } catch (firebaseError) {
      console.error('Firebase auth error:', firebaseError);
      return res.status(401).json({ error: 'Invalid Firebase token', details: firebaseError.message });
    }
    
    const { uid, email } = decodedToken;
    console.log(`DEBUG: Processing registration for Firebase UID: ${uid}, email: ${email}`);

    // Check if user already exists
    let user;
    try {
      user = await User.findOne({ firebaseUid: uid });
      console.log('DEBUG: User existence check completed');
      
      if (user) {
        console.log('DEBUG: User already exists in MongoDB');
        return res.status(400).json({ error: 'User already exists' });
      }
    } catch (dbError) {
      console.error('MongoDB lookup error:', dbError);
      return res.status(500).json({ error: 'Database error during user lookup', details: dbError.message });
    }

    console.log('DEBUG: Creating new user in MongoDB');
    // Create new user in MongoDB
    try {
      user = new User({
        firebaseUid: uid,
        email,
        displayName: decodedToken.name || req.body.displayName || email.split('@')[0],
        photoURL: decodedToken.picture || req.body.photoURL
      });

      await user.save();
      console.log('DEBUG: User saved successfully');
      res.status(201).json(user);
    } catch (saveError) {
      console.error('MongoDB save error:', saveError);
      return res.status(500).json({ 
        error: 'Error saving user to database', 
        details: saveError.message,
        validationErrors: saveError.errors ? Object.keys(saveError.errors).map(key => ({
          field: key,
          message: saveError.errors[key].message
        })) : null
      });
    }
  } catch (error) {
    console.error('Unexpected registration error:', error);
    res.status(500).json({ error: 'Error registering user', details: error.message });
  }
});

// Get current user profile (protected)
router.get('/me', authMiddleware, async (req, res) => {
  try {
    // User is already available in req.user from authMiddleware
    res.json(req.user);
  } catch (error) {
    console.error('Error getting user profile:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update user profile (protected)
router.put('/me', authMiddleware, async (req, res) => {
  try {
    // User is already available in req.user from authMiddleware
    const user = req.user;

    // Only update allowed fields
    const allowedUpdates = ['displayName', 'phoneNumber'];
    const updates = {};
    
    for (const field of allowedUpdates) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }

    // Update the user
    Object.assign(user, updates);
    await user.save();

    res.json(user);
  } catch (error) {
    console.error('Error updating user profile:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Add a property to favorites (protected)
router.post('/favorites/:propertyId', authMiddleware, async (req, res) => {
  try {
    const user = req.user;
    const propertyId = req.params.propertyId;
    
    // Check if already in favorites
    if (user.favorites.includes(propertyId)) {
      return res.status(400).json({ error: 'Property already in favorites' });
    }

    user.favorites.push(propertyId);
    await user.save();

    res.json({ message: 'Property added to favorites', favorites: user.favorites });
  } catch (error) {
    console.error('Error adding favorite:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Remove a property from favorites (protected)
router.delete('/favorites/:propertyId', authMiddleware, async (req, res) => {
  try {
    const user = req.user;
    const propertyId = req.params.propertyId;
    
    // Remove from favorites
    user.favorites = user.favorites.filter(id => id.toString() !== propertyId);
    await user.save();

    res.json({ message: 'Property removed from favorites', favorites: user.favorites });
  } catch (error) {
    console.error('Error removing favorite:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Admin route: Get all users (admin only)
router.get('/users', authMiddleware, requireAdmin, async (req, res) => {
  try {
    const users = await User.find({});
    res.json(users);
  } catch (error) {
    console.error('Error getting users:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Admin route: Update user role (admin only)
router.put('/users/:userId/role', authMiddleware, requireAdmin, async (req, res) => {
  try {
    const { role } = req.body;
    
    if (!role || !['user', 'admin'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role specified' });
    }
    
    const user = await User.findById(req.params.userId);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    user.role = role;
    await user.save();
    
    res.json({ message: 'User role updated successfully', user });
  } catch (error) {
    console.error('Error updating user role:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router; 