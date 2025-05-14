/**
 * Script to create a new admin user
 */

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

// Admin user details
const adminUser = {
  username: 'admin123',
  password: 'admin123',
  email: 'admin123@example.com',
  fullName: 'System Administrator',
  role: 'Admin',
  active: true
};

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

// Create admin user function
const createAdminUser = async () => {
  try {
    // Check if admin user already exists
    const existingUser = await User.findOne({ username: adminUser.username });
    
    if (existingUser) {
      console.log(`Admin user ${adminUser.username} already exists`);
      
      // Update the password
      const hashedPassword = await bcrypt.hash(adminUser.password, 10);
      existingUser.password = hashedPassword;
      await existingUser.save();
      
      console.log(`Updated password for ${adminUser.username}`);
      console.log(`New password: ${adminUser.password}`);
      console.log(`New password hash: ${hashedPassword}`);
    } else {
      // Create a new admin user
      const hashedPassword = await bcrypt.hash(adminUser.password, 10);
      
      const newUser = new User({
        ...adminUser,
        password: hashedPassword
      });
      
      await newUser.save();
      
      console.log(`Created new admin user: ${adminUser.username}`);
      console.log(`Password: ${adminUser.password}`);
      console.log(`Password hash: ${hashedPassword}`);
    }
    
    // Also create a test user with unhashed password for testing
    const testUser = {
      username: 'testadmin',
      password: 'password123',
      email: 'testadmin@example.com',
      fullName: 'Test Administrator',
      role: 'Admin',
      active: true
    };
    
    // Check if test user exists
    const existingTestUser = await User.findOne({ username: testUser.username });
    
    if (existingTestUser) {
      console.log(`Test user ${testUser.username} already exists`);
      
      // Update directly in the database to bypass hashing
      await mongoose.connection.collection('users').updateOne(
        { username: testUser.username },
        { $set: { password: testUser.password } }
      );
      
      console.log(`Updated password for ${testUser.username} (unhashed for testing)`);
      console.log(`New password: ${testUser.password}`);
    } else {
      // Create a test user with unhashed password
      await mongoose.connection.collection('users').insertOne({
        ...testUser,
        createdAt: new Date(),
        updatedAt: new Date(),
        tokens: []
      });
      
      console.log(`Created test user with unhashed password: ${testUser.username}`);
      console.log(`Password: ${testUser.password}`);
    }
    
    console.log('\nYou can now login with either:');
    console.log(`1. Username: ${adminUser.username}, Password: ${adminUser.password} (hashed)`);
    console.log(`2. Username: ${testUser.username}, Password: ${testUser.password} (unhashed for testing)`);
    
    // Close the connection
    mongoose.connection.close();
  } catch (error) {
    console.error('Error creating admin user:', error);
    mongoose.connection.close();
    process.exit(1);
  }
};

// Run the create admin user function
createAdminUser();