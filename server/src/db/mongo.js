const mongoose = require('mongoose');

let isConnected = false;

async function connectMongo() {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/tims_tourism';
  
  try {
    mongoose.set('strictQuery', false);
    
    // Connect with a 4 second server selection timeout
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 4000,
    });
    
    isConnected = true;
    console.log(`🍃 Connected to MongoDB successfully (${uri})`);
  } catch (err) {
    isConnected = false;
    console.warn(`⚠️ MongoDB connection note: Unable to reach MongoDB at ${uri} (${err.message}).`);
    console.warn(`👉 Auth will store and synchronize profiles via the persistent SQL database until MongoDB is available.`);
  }

  mongoose.connection.on('connected', () => {
    isConnected = true;
    console.log('🍃 MongoDB connection established');
  });

  mongoose.connection.on('error', (err) => {
    isConnected = false;
    console.warn('⚠️ MongoDB connection error:', err.message);
  });

  mongoose.connection.on('disconnected', () => {
    isConnected = false;
    console.log('🍃 MongoDB disconnected');
  });

  return isConnected;
}

function isMongoConnected() {
  return isConnected && mongoose.connection.readyState === 1;
}

module.exports = {
  connectMongo,
  isMongoConnected,
  mongoose
};
