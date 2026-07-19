const app = require('./src/app');
const connectDB = require('./src/config/db');
const config = require('./src/config/env');

async function start() {
  await connectDB();

  const server = app.listen(config.port, () => {
    console.log(`[server] Running in ${config.nodeEnv} mode on port ${config.port}`);
  });

  process.on('unhandledRejection', (err) => {
    console.error('[server] Unhandled Rejection:', err.message);
    server.close(() => process.exit(1));
  });
}

start();
