const mongoose = require('mongoose');

/**
 * Connect to MongoDB.
 * Connects directly to local MongoDB (Homebrew service running on localhost:27017).
 * Falls back to MongoMemoryServer only if local MongoDB is not running.
 */
const connectDB = async () => {
  if (mongoose.connection.readyState >= 1) return;

  const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/st-michel-school';

  try {
    console.log('\x1b[36m%s\x1b[0m', `Connecting to MongoDB at ${mongoUri}...`);
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('\x1b[32m%s\x1b[0m', `--- MONGODB CONNECTED: ${mongoose.connection.host} ---`);

    // Auto-seed initial data (Admin, default settings, classes, categories)
    const seedAuto = require('../seed_auto');
    await seedAuto();
    console.log('\x1b[32m%s\x1b[0m', '--- DATABASE READY WITH DEFAULT SEED DATA ---');

  } catch (localError) {
    console.warn('\x1b[33m%s\x1b[0m', `Local MongoDB connection failed (${localError.message}). Attempting MongoMemoryServer fallback...`);
    try {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      const mongod = await MongoMemoryServer.create();
      const memUri = mongod.getUri();
      console.log('\x1b[36m%s\x1b[0m', `--- IN-MEMORY MONGODB STARTED AT ${memUri} ---`);

      await mongoose.connect(memUri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });

      console.log('\x1b[32m%s\x1b[0m', '--- IN-MEMORY MONGODB CONNECTED SUCCESSFULLY ---');
      const seedAuto = require('../seed_auto');
      await seedAuto();
    } catch (memError) {
      console.error('\x1b[31m%s\x1b[0m', `--- DATABASE FATAL ERROR: ${memError.message} ---`);
    }
  }
};

module.exports = connectDB;

