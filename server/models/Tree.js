const mongoose = require('mongoose');

const treeSchema = new mongoose.Schema({
  treeCode: {
    type: String,
    required: [true, 'Tree Code / RFID is required'],
    unique: true,
    trim: true,
    uppercase: true
  },
  species: {
    type: String,
    required: [true, 'Common species name is required'],
    trim: true
  },
  scientificName: {
    type: String,
    trim: true,
    default: 'Plantae'
  },
  location: {
    type: String,
    required: [true, 'Location description is required'],
    trim: true
  },
  park: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Park',
    default: null
  },
  parkName: {
    type: String,
    default: 'General Urban Zone'
  },
  ageYears: {
    type: Number,
    required: [true, 'Age in years is required'],
    min: 0,
    default: 1
  },
  heightMeters: {
    type: Number,
    required: [true, 'Height in meters is required'],
    min: 0,
    default: 2.0
  },
  canopyDiameterMeters: {
    type: Number,
    default: 1.5,
    min: 0
  },
  healthStatus: {
    type: String,
    enum: ['Healthy', 'Needs Care', 'Diseased', 'Critical'],
    default: 'Healthy'
  },
  maintenanceStatus: {
    type: String,
    enum: ['Regular', 'Scheduled', 'Urgent', 'Under Treatment'],
    default: 'Regular'
  },
  plantedDate: {
    type: Date,
    default: Date.now
  },
  carbonAbsorptionKgPerYear: {
    type: Number,
    default: 22.0
  },
  notes: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Tree', treeSchema);
