const mongoose = require('mongoose');

const sensorSchema = new mongoose.Schema({
  deviceId: {
    type: String,
    required: true,
    trim: true
  },
  temperature: {
    type: Number,
    required: true
  },
  humidity: {
    type: Number,
    required: true
  },
  motion: {
    type: Number,
    required: true,
    min: 0,
    max: 1
  },
  light: {
    type: Number,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

// Create indexes for better query performance
sensorSchema.index({ deviceId: 1, timestamp: -1 });

module.exports = mongoose.model('Sensor', sensorSchema);
