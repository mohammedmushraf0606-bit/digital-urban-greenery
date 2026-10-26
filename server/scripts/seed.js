require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const User = require('../models/User');
const Park = require('../models/Park');
const Tree = require('../models/Tree');
const UrbanForest = require('../models/UrbanForest');
const GreenBelt = require('../models/GreenBelt');
const EnvironmentalIndicator = require('../models/EnvironmentalIndicator');
const Maintenance = require('../models/Maintenance');
const Report = require('../models/Report');

const {
  initialUsers,
  initialParks,
  initialTrees,
  initialUrbanForests,
  initialGreenBelts,
  initialEnvironmentalIndicators,
  initialMaintenances,
  initialReports
} = require('../data/seedData');

const seedDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/urban_greenery';
  console.log(`Connecting to MongoDB at: ${uri}`);

  try {
    await mongoose.connect(uri);
    console.log('✅ Connected to MongoDB. Clearing existing collections...');

    await Promise.all([
      User.deleteMany({}),
      Park.deleteMany({}),
      Tree.deleteMany({}),
      UrbanForest.deleteMany({}),
      GreenBelt.deleteMany({}),
      EnvironmentalIndicator.deleteMany({}),
      Maintenance.deleteMany({}),
      Report.deleteMany({})
    ]);

    console.log('🌱 Seeding fresh collections...');

    // Hash passwords
    const usersWithHash = await Promise.all(
      initialUsers.map(async (u) => {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(u.password, salt);
        return { ...u, password: hashedPassword };
      })
    );

    await User.insertMany(usersWithHash);
    await Park.insertMany(initialParks);
    await Tree.insertMany(initialTrees);
    await UrbanForest.insertMany(initialUrbanForests);
    await GreenBelt.insertMany(initialGreenBelts);
    await EnvironmentalIndicator.insertMany(initialEnvironmentalIndicators);
    await Maintenance.insertMany(initialMaintenances);
    await Report.insertMany(initialReports);

    console.log('🎉 MongoDB Database successfully seeded!');
    console.log('Sample Users:');
    console.log('  Admin:     admin@greencity.org / admin123');
    console.log('  Officer:   officer@greencity.org / officer123');
    console.log('  Inspector: inspector@greencity.org / inspector123');

    process.exit(0);
  } catch (err) {
    console.error('❌ MongoDB Seeding failed:', err.message);
    process.exit(1);
  }
};

seedDB();
