/**
 * Script to update a user's password directly in the database
 * Usage: node update-password.js <username> <new_password>
 */

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Get command line arguments
const args = process.argv.slice(2);
const username = args[0];
const newPassword = args[1];

if (!username || !newPassword) {
  console.error('Usage: node update-password.js <username> <new_password>');
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

// Update password function
const updatePassword = async (username, newPassword) => {
  try {
    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    console.log(`Generated hash for password "${newPassword}": ${hashedPassword}`);
    
    // Update the password directly in the database
    const result = await mongoose.connection.collection('users').updateOne(
      { username },
      { $set: { password: hashedPassword } }
    );
    
    if (result.matchedCount === 0) {
      console.error(`User not found: ${username}`);
      process.exit(1);
    }
    
    if (result.modifiedCount === 1) {
      console.log(`Password updated successfully for user: ${username}`);
      console.log(`New password: ${newPassword}`);
      console.log(`New password hash: ${hashedPassword}`);
    } else {
      console.log(`No changes made to password for user: ${username}`);
    }
    
    // Close the connection
    mongoose.connection.close();
  } catch (error) {
    console.error('Error updating password:', error);
    mongoose.connection.close();
    process.exit(1);
  }
};

// Run the update password function
updatePassword(username, newPassword);