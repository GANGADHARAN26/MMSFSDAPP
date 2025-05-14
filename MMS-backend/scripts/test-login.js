/**
 * Test script to diagnose login issues
 */

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
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

// Test function to check if users exist
const checkUsers = async () => {
  try {
    const users = await User.find({});
    console.log(`Found ${users.length} users in the database`);
    
    if (users.length > 0) {
      console.log('Sample user:', {
        username: users[0].username,
        role: users[0].role,
        active: users[0].active
      });
    } else {
      console.log('No users found. You may need to run the seed script first.');
    }
  } catch (error) {
    console.error('Error checking users:', error);
  }
};

// Test function to create a test user
const createTestUser = async () => {
  try {
    // Check if test user already exists
    const existingUser = await User.findOne({ username: 'testuser' });
    
    if (existingUser) {
      console.log('Test user already exists');
      return;
    }
    
    // Create a new test user
    const password = 'password123';
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const testUser = new User({
      username: 'testuser',
      password: hashedPassword,
      email: 'testuser@example.com',
      fullName: 'Test User',
      role: 'Admin',
      active: true
    });
    
    await testUser.save();
    console.log('Created test user with username: testuser and password: password123');
  } catch (error) {
    console.error('Error creating test user:', error);
  }
};

// Test function to verify login
const testLogin = async (username, password) => {
  try {
    console.log(`Attempting to login with username: ${username}`);
    
    // Find the user
    const user = await User.findOne({ username });
    
    if (!user) {
      console.error('User not found');
      return;
    }
    
    console.log('User found:', {
      username: user.username,
      role: user.role,
      active: user.active
    });
    
    // Test password comparison
    const isMatch = await bcrypt.compare(password, user.password);
    
    if (isMatch) {
      console.log('Password match: SUCCESS');
    } else {
      console.error('Password match: FAILED');
      console.log('Stored password hash:', user.password);
      
      // Test hashing the password again
      const newHash = await bcrypt.hash(password, 10);
      console.log('New hash for same password:', newHash);
    }
  } catch (error) {
    console.error('Error testing login:', error);
  }
};

// Run the tests
const runTests = async () => {
  await checkUsers();
  await createTestUser();
  
  // Test login with admin user
  await testLogin('admin', 'admin123');
  
  // Test login with test user
  await testLogin('testuser', 'password123');
  
  // Close the connection
  mongoose.connection.close();
  console.log('Tests completed');
};

runTests();