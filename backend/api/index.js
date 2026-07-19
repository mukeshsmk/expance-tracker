const app = require('../src/app');
const connectDB = require('../src/config/db');

// Kicks off the (cached) connection on cold start. Mongoose buffers
// queries by default, so requests that arrive before this resolves just
// wait rather than failing.
connectDB().catch((err) => {
  console.error('[db] Failed to connect to MongoDB:', err.message);
});

module.exports = app;
