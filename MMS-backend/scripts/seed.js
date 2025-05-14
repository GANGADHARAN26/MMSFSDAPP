/**
 * Database Seed Script
 * 
 * This script initializes the database with sample data for testing and development.
 * It creates users, assets, and sample transactions.
 */

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Import models
const User = require('../models/User');
const Asset = require('../models/Asset');
const Transfer = require('../models/Transfer');
const Purchase = require('../models/Purchase');
const Assignment = require('../models/Assignment');
const Expenditure = require('../models/Expenditure'); 
const ActivityLog = require('../models/ActivityLog');

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

// Sample data
const users = [
  {
    username: 'admin',
    password: 'admin123',
    email: 'admin@example.com',
    fullName: 'System Administrator',
    role: 'Admin',
    active: true
  },
  {
    username: 'commander1',
    password: 'password123',
    email: 'commander1@example.com',
    fullName: 'Base Commander Alpha',
    role: 'BaseCommander',
    assignedBase: 'Base Alpha',
    active: true
  },
  {
    username: 'commander2',
    password: 'password123',
    email: 'commander2@example.com',
    fullName: 'Base Commander Bravo',
    role: 'BaseCommander',
    assignedBase: 'Base Bravo',
    active: true
  },
  {
    username: 'logistics1',
    password: 'password123',
    email: 'logistics1@example.com',
    fullName: 'Logistics Officer 1',
    role: 'LogisticsOfficer',
    assignedBase: 'Base Alpha',
    active: true
  },
  {
    username: 'logistics2',
    password: 'password123',
    email: 'logistics2@example.com',
    fullName: 'Logistics Officer 2',
    role: 'LogisticsOfficer',
    assignedBase: 'Base Bravo',
    active: true
  }
];

const assets = [
  {
    name: 'M4 Rifle',
    type: 'Weapon',
    base: 'Base Alpha',
    openingBalance: 100,
    closingBalance: 100,
    purchases: 0,
    transferIn: 0,
    transferOut: 0,
    assigned: 0,
    expended: 0,
    available: 100
  },
  {
    name: 'M9 Pistol',
    type: 'Weapon',
    base: 'Base Alpha',
    openingBalance: 50,
    closingBalance: 50,
    purchases: 0,
    transferIn: 0,
    transferOut: 0,
    assigned: 0,
    expended: 0,
    available: 50
  },
  {
    name: 'Humvee',
    type: 'Vehicle',
    base: 'Base Alpha',
    openingBalance: 20,
    closingBalance: 20,
    purchases: 0,
    transferIn: 0,
    transferOut: 0,
    assigned: 0,
    expended: 0,
    available: 20
  },
  {
    name: '5.56mm Ammunition',
    type: 'Ammunition',
    base: 'Base Alpha',
    openingBalance: 10000,
    closingBalance: 10000,
    purchases: 0,
    transferIn: 0,
    transferOut: 0,
    assigned: 0,
    expended: 0,
    available: 10000
  },
  {
    name: 'M4 Rifle',
    type: 'Weapon',
    base: 'Base Bravo',
    openingBalance: 80,
    closingBalance: 80,
    purchases: 0,
    transferIn: 0,
    transferOut: 0,
    assigned: 0,
    expended: 0,
    available: 80
  },
  {
    name: 'M9 Pistol',
    type: 'Weapon',
    base: 'Base Bravo',
    openingBalance: 40,
    closingBalance: 40,
    purchases: 0,
    transferIn: 0,
    transferOut: 0,
    assigned: 0,
    expended: 0,
    available: 40
  },
  {
    name: 'Humvee',
    type: 'Vehicle',
    base: 'Base Bravo',
    openingBalance: 15,
    closingBalance: 15,
    purchases: 0,
    transferIn: 0,
    transferOut: 0,
    assigned: 0,
    expended: 0,
    available: 15
  },
  {
    name: '5.56mm Ammunition',
    type: 'Ammunition',
    base: 'Base Bravo',
    openingBalance: 8000,
    closingBalance: 8000,
    purchases: 0,
    transferIn: 0,
    transferOut: 0,
    assigned: 0,
    expended: 0,
    available: 8000
  }
];

// Seed function
const seedDatabase = async () => {
  try {
    // Clear existing data
    await User.deleteMany({});
    await Asset.deleteMany({});
    await Transfer.deleteMany({});
    await Purchase.deleteMany({});
    await Assignment.deleteMany({});
    await Expenditure.deleteMany({});
    await ActivityLog.deleteMany({});
    
    console.log('Cleared existing data');
    
    // Create users
    const createdUsers = [];
    for (const user of users) {
      const hashedPassword = await bcrypt.hash(user.password, 10);
      const newUser = new User({
        ...user,
        password: hashedPassword
      });
      await newUser.save();
      createdUsers.push(newUser);
      console.log(`Created user: ${user.username}`);
    }
    
    // Create assets
    const createdAssets = [];
    for (const asset of assets) {
      const newAsset = new Asset(asset);
      await newAsset.save();
      createdAssets.push(newAsset);
      console.log(`Created asset: ${asset.name} at ${asset.base}`);
    }
    
    // Create sample purchases
    const adminUser = createdUsers.find(u => u.role === 'Admin');
    const logisticsOfficer1 = createdUsers.find(u => u.username === 'logistics1');
    
    const purchase1 = new Purchase({
      assetName: 'M4 Rifle',
      assetType: 'Weapon',
      base: 'Base Alpha',
      quantity: 20,
      unitCost: 1200,
      totalCost: 24000,
      supplier: 'Military Weapons Inc.',
      purchaseDate: new Date(),
      status: 'Ordered',
      purchasedBy: logisticsOfficer1._id,
      invoiceNumber: 'INV-001',
      notes: 'Regular procurement'
    });
    
    await purchase1.save();
    console.log('Created sample purchase');
    
    // Create sample transfer
    const m4Alpha = createdAssets.find(a => a.name === 'M4 Rifle' && a.base === 'Base Alpha');
    const commander1 = createdUsers.find(u => u.username === 'commander1');
    const commander2 = createdUsers.find(u => u.username === 'commander2');
    
    const transfer1 = new Transfer({
      asset: m4Alpha._id,
      assetName: m4Alpha.name,
      assetType: m4Alpha.type,
      fromBase: 'Base Alpha',
      toBase: 'Base Bravo',
      quantity: 10,
      status: 'Pending',
      transferredBy: logisticsOfficer1._id,
      notes: 'Regular transfer'
    });
    
    await transfer1.save();
    console.log('Created sample transfer');
    
    // Create sample assignment
    const assignment1 = new Assignment({
      asset: m4Alpha._id,
      assetName: m4Alpha.name,
      assetType: m4Alpha.type,
      base: 'Base Alpha',
      quantity: 20,
      assignedTo: {
        name: 'Squad Alpha',
        rank: 'Squad',
        id: 'SQ-001'
      },
      assignedBy: commander1._id,
      purpose: 'Training Exercise',
      startDate: new Date(),
      status: 'Active',
      returnedQuantity: 0,
      notes: 'Weekly training'
    });
    
    await assignment1.save();
    
    // Update asset assigned quantity
    m4Alpha.assigned += 20;
    await m4Alpha.updateBalances();
    console.log('Created sample assignment');
    
    // Create sample expenditure
    const ammoAlpha = createdAssets.find(a => a.name === '5.56mm Ammunition' && a.base === 'Base Alpha');
    
    const expenditure1 = new Expenditure({
      asset: ammoAlpha._id,
      assetName: ammoAlpha.name,
      assetType: ammoAlpha.type,
      base: 'Base Alpha',
      quantity: 1000,
      reason: 'Training',
      authorizedBy: commander1._id,
      expendedBy: {
        name: 'Firearms Instructor',
        rank: 'Sergeant',
        id: 'SGT-123'
      },
      operationName: 'Marksmanship Training',
      expenditureDate: new Date(),
      location: 'Base Alpha Firing Range',
      notes: 'Weekly qualification'
    });
    
    await expenditure1.save();
    
    // Update asset expended quantity
    ammoAlpha.expended += 1000;
    await ammoAlpha.updateBalances();
    console.log('Created sample expenditure');
    
    // Create activity logs
    const activityLog1 = new ActivityLog({
      user: adminUser._id,
      username: adminUser.username,
      action: 'Create',
      resourceType: 'User',
      details: { message: 'System initialization' },
      timestamp: new Date()
    });
    
    await activityLog1.save();
    console.log('Created sample activity log');
    
    console.log('Database seeded successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

// Run the seed function
seedDatabase();