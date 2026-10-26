const mongoose = require('mongoose');

const greenBeltSchema = new mongoose.Schema({
  beltName: {
    type: String,
    required: [true, 'Green belt name is required'],
    trim: true
  },
  location: {
    type: String,
    required: [true, 'Location is required'],
    trim: true
  },
  lengthKm: {
    type: Number,
    required: [true, 'Length in kilometers is required'],
    min: 0
  },
  widthMeters: {
    type: Number,
    required: [true, 'Width in meters is required'],
    min: 0
  },
  areaSqM: {
    type: Number,
    default: function() {
      return (this.lengthKm * 1000) * this.widthMeters;
    }
  },
  vegetationType: {
    type: String,
    enum: ['Dense Tree Line', 'Shrub & Hedge Buffer', 'Mixed Canopy', 'Grass & Perennial Strip', 'Acoustic Barrier'],
    default: 'Mixed Canopy'
  },
  status: {
    type: String,
    enum: ['Optimal', 'Under Maintenance', 'Encroachment Risk', 'Expansion Phase'],
    default: 'Optimal'
  },
  maintenanceInfo: {
    type: String,
    default: 'Bi-weekly watering, periodic pruning of roadside branches'
  },
  soilType: {
    type: String,
    default: 'Loamy Soil'
  },
  irrigationType: {
    type: String,
    enum: ['Drip Irrigation', 'Sprinkler', 'Treated Water Tanker', 'Rain-fed'],
    default: 'Drip Irrigation'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('GreenBelt', greenBeltSchema);
