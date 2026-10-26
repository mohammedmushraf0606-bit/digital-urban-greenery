const mongoose = require('mongoose');

const urbanForestSchema = new mongoose.Schema({
  forestName: {
    type: String,
    required: [true, 'Urban forest name is required'],
    trim: true
  },
  location: {
    type: String,
    required: [true, 'Location is required'],
    trim: true
  },
  areaHectares: {
    type: Number,
    required: [true, 'Area in hectares is required'],
    min: 0
  },
  treeCount: {
    type: Number,
    default: 0,
    min: 0
  },
  canopyCoverPercentage: {
    type: Number,
    min: 0,
    max: 100,
    default: 65
  },
  biodiversityIndex: {
    type: Number,
    min: 0,
    max: 5,
    default: 3.5
  },
  establishedYear: {
    type: Number,
    default: 2018
  },
  supervisor: {
    type: String,
    default: 'District Forestry Officer'
  },
  status: {
    type: String,
    enum: ['Protected Reserve', 'Developing Woodland', 'Restoration Area', 'Miyawaki Forest'],
    default: 'Protected Reserve'
  },
  maintenanceStatus: {
    type: String,
    enum: ['Well Managed', 'Moderate', 'Needs Attention'],
    default: 'Well Managed'
  },
  dominantFlora: {
    type: [String],
    default: ['Sal', 'Teak', 'Neem', 'Bamboo']
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('UrbanForest', urbanForestSchema);
