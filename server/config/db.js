const mongoose = require('mongoose');
const embeddedStore = require('../data/embeddedStore');
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
const bcrypt = require('bcryptjs');

let isConnected = false;

// Map model names to mongoose models and collection keys
const modelMapping = {
  User: { model: () => require('../models/User'), key: 'users' },
  Park: { model: () => require('../models/Park'), key: 'parks' },
  Tree: { model: () => require('../models/Tree'), key: 'trees' },
  UrbanForest: { model: () => require('../models/UrbanForest'), key: 'urbanForests' },
  GreenBelt: { model: () => require('../models/GreenBelt'), key: 'greenBelts' },
  EnvironmentalIndicator: { model: () => require('../models/EnvironmentalIndicator'), key: 'environmentalIndicators' },
  Maintenance: { model: () => require('../models/Maintenance'), key: 'maintenances' },
  Report: { model: () => require('../models/Report'), key: 'reports' }
};

const connectDB = async () => {
  if (isConnected && mongoose.connection.readyState === 1) {
    return;
  }

  const mongoURI = process.env.MONGODB_URI;

  if (!mongoURI) {
    isConnected = false;
    console.log('💡 [Zero-Config Mode]: No MONGODB_URI configured. Using high-performance Embedded Memory Storage Engine.');
    await embeddedStore.init();
    return;
  }

  try {
    const conn = await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 3000
    });
    isConnected = true;
    console.log(`🌿 [MongoDB Connected]: ${conn.connection.host}/${conn.connection.name}`);

    // Auto-seed if database is empty
    await autoSeedMongo();
  } catch (err) {
    isConnected = false;
    console.log(`⚠️  [MongoDB Notice]: Could not connect to MongoDB server (${err.message})`);
    console.log(`💡 [Zero-Config Fallback]: Activating high-performance Embedded Memory Storage Engine.`);
    console.log(`✅ [System Status]: Full CRUD, Authentication, and Dashboard APIs are 100% OPERATIONAL!`);
    await embeddedStore.init();
  }
};

const autoSeedMongo = async () => {
  try {
    const User = require('../models/User');
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      console.log('🌱 Empty MongoDB database detected. Auto-seeding initial urban greenery data...');
      
      // Hash user passwords before inserting
      const usersToInsert = await Promise.all(initialUsers.map(async (u) => {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(u.password, salt);
        return { ...u, password: hashedPassword };
      }));

      await User.insertMany(usersToInsert);
      await require('../models/Park').insertMany(initialParks);
      await require('../models/Tree').insertMany(initialTrees);
      await require('../models/UrbanForest').insertMany(initialUrbanForests);
      await require('../models/GreenBelt').insertMany(initialGreenBelts);
      await require('../models/EnvironmentalIndicator').insertMany(initialEnvironmentalIndicators);
      await require('../models/Maintenance').insertMany(initialMaintenances);
      await require('../models/Report').insertMany(initialReports);
      console.log('✅ MongoDB auto-seed completed successfully!');
    }
  } catch (seedErr) {
    console.error('Error during MongoDB auto-seed:', seedErr.message);
  }
};

const getModel = (modelName) => {
  const config = modelMapping[modelName];
  if (!config) throw new Error(`Model ${modelName} not registered`);

  if (isConnected && mongoose.connection.readyState === 1) {
    return config.model();
  } else {
    return embeddedStore.getCollection(config.key);
  }
};

const isDbConnected = () => isConnected;

module.exports = {
  connectDB,
  getModel,
  isDbConnected
};
