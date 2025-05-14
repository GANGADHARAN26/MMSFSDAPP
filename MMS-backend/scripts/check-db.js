/**
 * Script to check MongoDB connection and database status
 */

require('dotenv').config();
const mongoose = require('mongoose');

console.log('MongoDB URI:', process.env.MONGODB_URI);

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(async () => {
  console.log('Connected to MongoDB successfully');
  
  // Get database information
  const db = mongoose.connection.db;
  
  try {
    // List collections
    const collections = await db.listCollections().toArray();
    console.log(`\nDatabase has ${collections.length} collections:`);
    collections.forEach(collection => {
      console.log(`- ${collection.name}`);
    });
    
    // Count documents in each collection
    console.log('\nDocument counts:');
    for (const collection of collections) {
      const count = await db.collection(collection.name).countDocuments();
      console.log(`- ${collection.name}: ${count} documents`);
    }
    
    // Check database stats
    const stats = await db.stats();
    console.log('\nDatabase stats:');
    console.log(`- Database: ${stats.db}`);
    console.log(`- Collections: ${stats.collections}`);
    console.log(`- Objects: ${stats.objects}`);
    console.log(`- Storage size: ${(stats.storageSize / 1024 / 1024).toFixed(2)} MB`);
    
    console.log('\nDatabase check completed successfully');
  } catch (error) {
    console.error('Error checking database:', error);
  } finally {
    // Close the connection
    mongoose.connection.close();
  }
})
.catch(err => {
  console.error('MongoDB connection error:', err);
  process.exit(1);
});