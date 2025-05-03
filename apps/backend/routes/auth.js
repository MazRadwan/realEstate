const express = require('express');
const { getAuth } = require('firebase-admin/auth');
const User = require('../models/User');
const router = express.Router();

// Register a new user
router.post('/register', async (req, res) => {
  try {
    // Verify the Firebase token
    const token = req.headers.authorization?.split('Bearer ')[1];
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decodedToken = await getAuth().verifyIdToken(token);
    const { uid, email, name, picture } = decodedToken;

    // Check if user already exists
    let user = await User.findOne({ firebaseUid: uid });
    
    if (user) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Create new user in MongoDB
    user = new User({
      firebaseUid: uid,
      email,
      displayName: name || req.body.displayName,
      photoURL: picture || req.body.photoURL,
      phoneNumber: req.body.phoneNumber
    });

    await user.save();
    res.status(201).json(user);
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Error registering user' });
  }
});

// Get current user profile
router.get('/me', async (req, res) => {
  try {
    const token = req.headers.authorization?.split('Bearer ')[1];
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decodedToken = await getAuth().verifyIdToken(token);
    const user = await User.findOne({ firebaseUid: decodedToken.uid });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Error getting user profile:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update user profile
router.put('/me', async (req, res) => {
  try {
    const token = req.headers.authorization?.split('Bearer ')[1];
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decodedToken = await getAuth().verifyIdToken(token);
    const user = await User.findOne({ firebaseUid: decodedToken.uid });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

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

// Add a property to favorites
router.post('/favorites/:propertyId', async (req, res) => {
  try {
    const token = req.headers.authorization?.split('Bearer ')[1];
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decodedToken = await getAuth().verifyIdToken(token);
    const user = await User.findOne({ firebaseUid: decodedToken.uid });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

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

// Remove a property from favorites
router.delete('/favorites/:propertyId', async (req, res) => {
  try {
    const token = req.headers.authorization?.split('Bearer ')[1];
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decodedToken = await getAuth().verifyIdToken(token);
    const user = await User.findOne({ firebaseUid: decodedToken.uid });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

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

// Admin route: Get all users (protected by middleware)
router.get('/users', async (req, res) => {
  try {
    // Check if admin (should be done in middleware)
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    
    const users = await User.find({});
    res.json(users);
  } catch (error) {
    console.error('Error getting users:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router; 