const mongoose = require('mongoose');
const config = require('./env');

// Cached across warm serverless invocations so each request doesn't open
// a new connection (and exhaust Atlas's connection limit). A cold start
// creates the promise; every later call in that same process reuses it.
let connectionPromise = null;

function connectDB() {
  if (connectionPromise) return connectionPromise;

  mongoose.set('strictQuery', true);
  connectionPromise = mongoose
    .connect(config.mongoUri, { autoIndex: config.nodeEnv !== 'production' })
    .then((conn) => {
      console.log(`[db] MongoDB connected: ${conn.connection.host}`);
      mongoose.connection.on('error', (err) => {
        console.error('[db] MongoDB connection error:', err.message);
      });
      mongoose.connection.on('disconnected', () => {
        console.warn('[db] MongoDB disconnected. Attempting to reconnect is handled by the driver.');
      });
      return conn;
    })
    .catch((err) => {
      connectionPromise = null; // allow a retry on the next call instead of caching a failure
      throw err;
    });

  return connectionPromise;
}

module.exports = connectDB;
