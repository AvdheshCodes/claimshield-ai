/**
 * Database Seeder — creates demo accounts and sample claims
 * Run: node src/utils/seeder.js
 */
require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const mongoose = require('mongoose');
const User = require('../models/User');
const Claim = require('../models/Claim');

const connectDB = async () => {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/claimshield');
  console.log('MongoDB connected for seeding...');
};

const seedUsers = async () => {
  await User.deleteMany({});

  const users = await User.insertMany([
    { name: 'Admin User', email: process.env.DEMO_ADMIN_EMAIL || 'admin@claimshield.demo', password: process.env.DEMO_ADMIN_PASSWORD || 'Admin@123456', role: 'admin' },
    { name: 'Sarah Officer', email: process.env.DEMO_OFFICER_EMAIL || 'officer@claimshield.demo', password: process.env.DEMO_OFFICER_PASSWORD || 'Officer@123456', role: 'officer' },
    { name: 'Rahul Sharma', email: 'rahul@demo.com', password: 'Demo@123456', role: 'applicant' },
    { name: 'Priya Verma', email: 'priya@demo.com', password: 'Demo@123456', role: 'applicant' },
    { name: 'Amit Kumar', email: 'amit@demo.com', password: 'Demo@123456', role: 'applicant' }
  ]);

  console.log(`✅ Seeded ${users.length} users`);
  return users;
};

const seedClaims = async (users) => {
  await Claim.deleteMany({});

  const applicants = users.filter(u => u.role === 'applicant');

  const claims = await Claim.insertMany([
    // Scenario A — Normal claim
    {
      applicant: applicants[0]._id,
      claimantName: 'Rahul Sharma',
      policyNumber: 'POL-2024-NORMAL-001',
      vehicleRegistration: 'MH12AB1234',
      accidentDate: new Date('2024-10-15'),
      accidentDescription: 'Vehicle hit a pothole on Mumbai-Pune expressway, causing suspension damage and front tyre blowout.',
      claimedAmount: 45000,
      contactPhone: '9876543210',
      contactEmail: 'rahul@demo.com',
      status: 'submitted',
      riskScore: null,
      riskCategory: null
    },
    // Scenario B — Suspicious claim (pre-flagged for demo)
    {
      applicant: applicants[1]._id,
      claimantName: 'Priya Verma',
      policyNumber: 'POL-2024-SUSP-002',
      vehicleRegistration: 'DL05MN5678',
      accidentDate: new Date('2024-10-20'),
      accidentDescription: 'Rear-end collision at traffic signal near Connaught Place, Delhi.',
      claimedAmount: 95000,
      contactPhone: '9876500001',
      contactEmail: 'priya@demo.com',
      status: 'under_review',
      riskScore: 80,
      riskCategory: 'high_priority'
    },
    // Scenario C — Incomplete claim
    {
      applicant: applicants[2]._id,
      claimantName: 'Amit Kumar',
      policyNumber: 'POL-2024-INCMPL-003',
      vehicleRegistration: 'KA05XY9012',
      accidentDate: new Date('2024-11-01'),
      accidentDescription: 'Side impact collision at Bangalore Ring Road junction.',
      claimedAmount: 32000,
      contactPhone: '9876500002',
      contactEmail: 'amit@demo.com',
      status: 'additional_info_required',
      riskScore: 10,
      riskCategory: 'low'
    }
  ]);

  console.log(`✅ Seeded ${claims.length} sample claims`);
};

const run = async () => {
  try {
    await connectDB();
    const users = await seedUsers();
    await seedClaims(users);
    console.log('\n🎉 Database seeded successfully!\n');
    console.log('Demo accounts:');
    console.log('  Admin:     admin@claimshield.demo  / Admin@123456');
    console.log('  Officer:   officer@claimshield.demo / Officer@123456');
    console.log('  Applicant: rahul@demo.com          / Demo@123456');
    process.exit(0);
  } catch (err) {
    console.error('Seeding failed:', err);
    process.exit(1);
  }
};

run();
