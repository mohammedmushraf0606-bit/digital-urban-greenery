const mongoose = require('mongoose');

const parkSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Park name is required'],
    trim: true
  },
  location: {
    type: String,
    required: [true, 'Location is required'],
    trim: true
  },
  wardNo: {
    type: String,
    default: 'Ward 01'
  },
  areaSqM: {
    type: Number,
    required: [true, 'Area in square meters is required'],
    min: [0, 'Area cannot be negative']
  },
  parkType: {
    type: String,
    enum: ['Public Park', 'Botanical Garden', 'Children Park', 'Ecological Park', 'Neighborhood Park', 'Heritage Garden'],
    default: 'Public Park'
  },
  establishedYear: {
    type: Number,
    default: () => new Date().getFullYear()
  },
  contactOfficer: {
    type: String,
    default: 'Greenery Officer'
  },
  contactPhone: {
    type: String,
    default: '+91 98765 43210'
  },
  facilities: {
    type: [String],
    default: ['Walking Track', 'Benches', 'Irrigation System']
  },
  status: {
    type: String,
    enum: ['Active', 'Under Renovation', 'Planned', 'Temporarily Closed'],
    default: 'Active'
  },
  maintenanceStatus: {
    type: String,
    enum: ['Excellent', 'Good', 'Fair', 'Needs Maintenance'],
    default: 'Good'
  },
  treeCount: {
    type: Number,
    default: 0
  },
  imageUrl: {
    type: String,
    default: 'https://images.unsplash.com/photo-1519331379826-f10be5486c6f?w=600&auto=format&fit=crop&q=80'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Park', parkSchema);
