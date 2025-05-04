const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  firebaseUid: { 
    type: String, 
    required: true, 
    unique: true 
  },
  email: { 
    type: String, 
    required: true,
    unique: true 
  },
  displayName: { 
    type: String 
  },
  photoURL: {
    type: String
  },
  role: { 
    type: String, 
    enum: ['user', 'admin', 'agent'], 
    default: 'user' 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  lastLogin: { 
    type: Date 
  },
  phoneNumber: {
    type: String
  },
  favorites: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Property'
  }]
});

// Method to safely expose user data without sensitive fields
userSchema.methods.toJSON = function() {
  const user = this.toObject();
  delete user.__v;
  return user;
};

module.exports = mongoose.model('User', userSchema); 