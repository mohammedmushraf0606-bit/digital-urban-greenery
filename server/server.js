require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { connectDB, isDbConnected } = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

// Route imports
const authRoutes = require('./routes/authRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const parkRoutes = require('./routes/parkRoutes');
const treeRoutes = require('./routes/treeRoutes');
const urbanForestRoutes = require('./routes/urbanForestRoutes');
const greenBeltRoutes = require('./routes/greenBeltRoutes');
const environmentalRoutes = require('./routes/environmentalRoutes');
const maintenanceRoutes = require('./routes/maintenanceRoutes');
const reportRoutes = require('./routes/reportRoutes');

const app = express();

// Middlewares
app.use(cors({
  origin: '*',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logger for debugging
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Serverless URL normalization: ensures routes match consistently
app.use((req, res, next) => {
  if (!req.url.startsWith('/api') && req.url !== '/') {
    req.url = '/api' + req.url;
  }
  next();
});

// Root / Health check
app.get(['/', '/api'], (req, res) => {
  res.json({
    message: '🌿 Digital Urban Greenery Management System API',
    status: 'ONLINE',
    version: '1.0.0',
    database: isDbConnected() ? 'MongoDB Active' : 'Embedded Memory Store Active (Zero-Config Mode)',
    endpoints: {
      auth: '/api/auth',
      dashboard: '/api/dashboard/stats',
      parks: '/api/parks',
      trees: '/api/trees',
      urbanForests: '/api/urban-forests',
      greenBelts: '/api/green-belts',
      environmental: '/api/environmental-indicators',
      maintenance: '/api/maintenance',
      reports: '/api/reports'
    }
  });
});

app.get(['/health', '/api/health'], (req, res) => {
  res.json({
    status: 'UP',
    uptime: process.uptime(),
    timestamp: new Date(),
    database: isDbConnected() ? 'MongoDB Connected' : 'Embedded Zero-Config Store'
  });
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/parks', parkRoutes);
app.use('/api/trees', treeRoutes);
app.use('/api/urban-forests', urbanForestRoutes);
app.use('/api/green-belts', greenBeltRoutes);
app.use('/api/environmental-indicators', environmentalRoutes);
app.use('/api/maintenance', maintenanceRoutes);
app.use('/api/reports', reportRoutes);

// 404 handler for unknown routes
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `API Route not found: ${req.originalUrl}`
  });
});

// Centralized error handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

if (require.main === module) {
  connectDB().then(() => {
    app.listen(PORT, () => {
      console.log(`🚀 Server running in ${process.env.NODE_ENV || 'development'} mode on http://localhost:${PORT}`);
      console.log(`📡 Ready to receive REST API requests!`);
    });
  });
}

module.exports = { app, connectDB };
