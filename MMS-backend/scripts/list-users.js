/**
 * Script to list all users in the database
 */

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

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

// List users function
const listUsers = async () => {
  try {
    // Get all users from the database
    const users = await User.find({});
    
    console.log(`\nFound ${users.length} users in the database:\n`);
    
    // Display user information
    users.forEach((user, index) => {
      console.log(`User ${index + 1}:`);
      console.log(`- Username: ${user.username}`);
      console.log(`- Email: ${user.email}`);
      console.log(`- Full Name: ${user.fullName}`);
      console.log(`- Role: ${user.role}`);
      console.log(`- Assigned Base: ${user.assignedBase || 'None'}`);
      console.log(`- Active: ${user.active}`);
      console.log(`- Password Hash: ${user.password}`);
      console.log(`- Created At: ${user.createdAt}`);
      console.log(`- Last Login: ${user.lastLogin || 'Never'}`);
      console.log('');
    });
    
    // Close the connection
    mongoose.connection.close();
  } catch (error) {
    console.error('Error listing users:', error);
    mongoose.connection.close();
    process.exit(1);
  }
};

// Run the list users function
listUsers();