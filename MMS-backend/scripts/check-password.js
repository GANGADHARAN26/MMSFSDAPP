/**
 * Script to check a user's password hash and compare it with a provided password
 * Usage: node check-password.js <username> <password_to_check>
 */

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

// Get command line arguments
const args = process.argv.slice(2);
const username = args[0];
const passwordToCheck = args[1];

if (!username || !passwordToCheck) {
  console.error('Usage: node check-password.js <username> <password_to_check>');
  process.exit(1);
}

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => {
  console.error('MongoDB connection error:', err);
  process.exit(1);
});

// Check password function
const checkPassword = async (username, passwordToCheck) => {
  try {
    // Find the user
    const user = await User.findOne({ username }).select('+password');
    
    if (!user) {
      console.error(`User not found: ${username}`);
      process.exit(1);
    }
    
    console.log(`Found user: ${user.username} (${user.role})`);
    console.log(`Password hash: ${user.password}`);
    
    // Check if the password is correct
    const isMatch = await bcrypt.compare(passwordToCheck, user.password);
    
    if (isMatch) {
      console.log(`Password match: SUCCESS - "${passwordToCheck}" is the correct password`);
    } else {
      console.log(`Password match: FAILED - "${passwordToCheck}" is NOT the correct password`);
      
      // Create a new hash for the provided password
      const newHash = await bcrypt.hash(passwordToCheck, 10);
      console.log(`New hash for "${passwordToCheck}": ${newHash}`);
    }
    
    // Close the connection
    mongoose.connection.close();
  } catch (error) {
    console.error('Error checking password:', error);
    mongoose.connection.close();
    process.exit(1);
  }
};

// Run the check password function
checkPassword(username, passwordToCheck);