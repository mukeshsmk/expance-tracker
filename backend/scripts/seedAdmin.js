/**
 * Run once to create the first admin account:
 *   node scripts/seedAdmin.js
 */
require('dotenv').config();
const mongoose = require('mongoose');
const config = require('../src/config/env');
const User = require('../src/models/User');

async function seed() {
  await mongoose.connect(config.mongoUri);

  const email = process.env.SEED_ADMIN_EMAIL || 'admin@construction.com';
  const existing = await User.findOne({ email });
  if (existing) {
    console.log(`Admin already exists: ${email}`);
    process.exit(0);
  }

  await User.create({
    name: 'System Admin',
    email,
    password: process.env.SEED_ADMIN_PASSWORD || 'Admin@12345',
    role: 'admin',
    status: 'active',
  });

  console.log(`Admin user created: ${email} / (password from SEED_ADMIN_PASSWORD or default)`);
  process.exit(0);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
