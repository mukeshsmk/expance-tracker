const dotenv = require('dotenv');
dotenv.config();

const required = ['MONGO_URI'];

function validateEnv() {
  const missing = required.filter((key) => !process.env[key]);
  if (missing.length > 0 && process.env.NODE_ENV !== 'test') {
    console.warn(
      `[config] Warning: missing environment variables: ${missing.join(', ')}. ` +
      `Copy .env.example to .env and fill in real values before running in production.`
    );
  }
}

validateEnv();

module.exports = {
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  mongoUri: process.env.MONGO_URI || 'mongodb://localhost:27017/construction_expense_db',
  maxFileSizeMb: Number(process.env.MAX_FILE_SIZE_MB) || 10,
  clientUrl: process.env.CLIENT_URL || 'http://localhost:4200',
};
