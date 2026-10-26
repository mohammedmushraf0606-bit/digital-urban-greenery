const mongoose = require('mongoose');

const environmentalIndicatorSchema = new mongoose.Schema({
  recordDate: {
    type: Date,
    default: Date.now,
    required: true
  },
  zoneLocation: {
    type: String,
    required: [true, 'Zone / City sector is required'],
    trim: true
  },
  aqi: {
    type: Number,
    required: [true, 'AQI value is required'],
    min: 0,
    max: 500
  },
  pm25: {
    type: Number,
    default: 35.0,
    min: 0
  },
  pm10: {
    type: Number,
    default: 65.0,
    min: 0
  },
  greenCoveragePercentage: {
    type: Number,
    required: [true, 'Green coverage percentage is required'],
    min: 0,
    max: 100
  },
  carbonAbsorptionTonnesYear: {
    type: Number,
    required: [true, 'Estimated carbon absorption is required'],
    min: 0
  },
  treeSurvivalRate: {
    type: Number,
    required: [true, 'Tree survival rate is required'],
    min: 0,
    max: 100
  },
  waterUsageKLMonth: {
    type: Number,
    required: [true, 'Water usage in kilo-liters is required'],
    min: 0
  },
  environmentalScore: {
    type: Number,
    min: 0,
    max: 100,
    default: function() {
      // Calculated composite score: weight green coverage, survival rate, and inverse AQI
      const aqiFactor = Math.max(0, 100 - (this.aqi / 3));
      return Math.round((this.greenCoveragePercentage * 0.35) + (this.treeSurvivalRate * 0.35) + (aqiFactor * 0.3));
    }
  },
  recordedBy: {
    type: String,
    default: 'Environmental Quality Monitoring Station'
  },
  remarks: {
    type: String,
    default: 'Normal urban sensor reading'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('EnvironmentalIndicator', environmentalIndicatorSchema);
