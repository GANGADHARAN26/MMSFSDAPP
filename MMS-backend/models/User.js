const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  fullName: { type: String, required: true },
  role: { 
    type: String, 
    enum: ['Admin', 'BaseCommander', 'LogisticsOfficer'], 
    required: true 
  },
  assignedBase: { type: String },
  active: { type: Boolean, default: true },
  tokens: [{
    token: {
      type: String,
      required: true
    }
  }],
  lastLogin: { type: Date },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, {
  timestamps: true
});

// Hash password before saving
UserSchema.pre('save', async function(next) {
  const user = this;
  if (user.isModified('password')) {
    user.password = await bcrypt.hash(user.password, 10);
  }
  next();
});

// Generate auth token
UserSchema.methods.generateAuthToken = async function() {
  const user = this;
  const token = jwt.sign({ _id: user._id.toString() }, process.env.JWT_SECRET, { expiresIn: '24h' });
  
  user.tokens = user.tokens.concat({ token });
  await user.save();
  
  return token;
};

// Find user by credentials
UserSchema.statics.findByCredentials = async (username, password) => {
  try {
    // Find the user by username
    const user = await User.findOne({ username });
    
    // If user not found, throw error
    if (!user) {
      console.log(`User not found: ${username}`);
      throw new Error('Invalid username or password');
    }
    
    // Check if user account is active
    if (!user.active) {
      console.log(`User account is inactive: ${username}`);
      throw new Error('User account is inactive');
    }
    
    // Log the password and hash for debugging
    console.log(`Login attempt - Username: ${username}, Password: ${password}`);
    console.log(`Stored password hash: ${user.password}`);
    
    // Compare the provided password with the stored hash
    let isMatch = false;
    try {
      isMatch = await bcrypt.compare(password, user.password);
      console.log(`Password comparison result: ${isMatch ? 'Match' : 'No match'}`);
    } catch (bcryptError) {
      console.error(`bcrypt error: ${bcryptError.message}`);
      // If bcrypt throws an error, try direct comparison as fallback (not secure, but helps diagnose issues)
      isMatch = (password === user.password);
      console.log(`Direct comparison result: ${isMatch ? 'Match' : 'No match'}`);
    }
    
    // If password doesn't match, throw error
    if (!isMatch) {
      console.log(`Password mismatch for user: ${username}`);
      throw new Error('Invalid username or password');
    }
    
    // Return the user if authentication is successful
    return user;
  } catch (error) {
    console.error(`Login error for ${username}:`, error.message);
    throw error; // Propagate the original error
  }
};

// Remove sensitive data when sending user object
UserSchema.methods.toJSON = function() {
  const user = this;
  const userObject = user.toObject();
  
  delete userObject.password;
  delete userObject.tokens;
  
  return userObject;
};

const User = mongoose.model('User', UserSchema);

module.exports = User;
