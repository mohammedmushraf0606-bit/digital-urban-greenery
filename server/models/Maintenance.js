const mongoose = require('mongoose');

const maintenanceSchema = new mongoose.Schema({
  targetType: {
    type: String,
    enum: ['Park', 'Tree', 'Urban Forest', 'Green Belt', 'General Facility'],
    required: [true, 'Target greenery type is required']
  },
  targetName: {
    type: String,
    required: [true, 'Target name or reference identifier is required'],
    trim: true
  },
  activityType: {
    type: String,
    enum: ['Pruning & Trimming', 'Irrigation & Watering', 'Pest Control', 'Fertilizer Application', 'Tree Planting', 'Health Inspection', 'Soil Aeration', 'Trash Cleanup'],
    required: [true, 'Activity type is required']
  },
  scheduledDate: {
    type: Date,
    required: [true, 'Scheduled date is required'],
    default: Date.now
  },
  completedDate: {
    type: Date,
    default: null
  },
  responsibleTeam: {
    type: String,
    required: [true, 'Responsible person/team is required'],
    trim: true
  },
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Urgent'],
    default: 'Medium'
  },
  cost: {
    type: Number,
    min: 0,
    default: 0
  },
  status: {
    type: String,
    enum: ['Scheduled', 'In Progress', 'Completed', 'Cancelled'],
    default: 'Scheduled'
  },
  remarks: {
    type: String,
    trim: true,
    default: ''
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Maintenance', maintenanceSchema);
