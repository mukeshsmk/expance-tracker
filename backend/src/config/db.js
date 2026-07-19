const mongoose = require('mongoose');
const config = require('./env');

async function connectDB() {
  try {
    mongoose.set('strictQuery', true);
    const conn = await mongoose.connect(config.mongoUri, {
      autoIndex: config.nodeEnv !== 'production',
    });
    console.log(`[db] MongoDB connected: ${conn.connection.host}`);

    mongoose.connection.on('error', (err) => {
      console.error('[db] MongoDB connection error:', err.message);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('[db] MongoDB disconnected. Attempting to reconnect is handled by the driver.');
    });
  } catch (err) {
    console.error(`[db] Failed to connect to MongoDB: ${err.message}`);
    process.exit(1);
  }
}

module.exports = connectDB;
