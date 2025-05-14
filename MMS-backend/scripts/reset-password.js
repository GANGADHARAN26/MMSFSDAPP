/**
 * Script to reset a user's password
 * Usage: node reset-password.js <username> <new_password>
 */

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

// Get command line arguments
const args = process.argv.slice(2);
const username = args[0];
const newPassword = args[1];

if (!username || !newPassword) {
  console.error('Usage: node reset-password.js <username> <new_password>');
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

// Reset password function
const resetPassword = async (username, newPassword) => {
  try {
    // Find the user
    const user = await User.findOne({ username });
    
    if (!user) {
      console.error(`User not found: ${username}`);
      process.exit(1);
    }
    
    console.log(`Found user: ${user.username} (${user.role})`);
    
    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    // Update the password directly in the database to bypass any middleware
    const result = await User.updateOne(
      { _id: user._id },
      { $set: { password: hashedPassword } }
    );
    
    if (result.modifiedCount === 1) {
      console.log(`Password reset successful for user: ${username}`);
    } else {
      console.error('Password reset failed');
    }
    
    // Close the connection
    mongoose.connection.close();
  } catch (error) {
    console.error('Error resetting password:', error);
    mongoose.connection.close();
    process.exit(1);
  }
};

// Run the reset password function
resetPassword(username, newPassword);