const mongoose = require('mongoose');
require('dotenv').config();

async function testConnection() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB connected successfully!');
    
    const userCount = await mongoose.connection.db.collection('users').countDocuments();
    console.log('Users collection accessible, count:', userCount);
    
    await mongoose.disconnect();
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
  }
}

testConnection();