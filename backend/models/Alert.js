const mongoose = require('mongoose');

const alertSchema = new mongoose.Schema({
  sensorType: {
    type: String,
    required: true,
    enum: ['temperature', 'humidity', 'light', 'motion']
  },
  deviceId: {
    type: String,
    required: true
  },
  value: {
    type: Number,
    required: true
  },
  threshold: {
    type: Number,
    required: true
  },
  type: {
    type: String,
    enum: ['info', 'warning', 'critical'],
    default: 'warning'
  },
  message: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  acknowledged: {
    type: Boolean,
    default: false
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
});

// Create indexes for better query performance
alertSchema.index({ deviceId: 1, timestamp: -1 });
alertSchema.index({ acknowledged: 1, timestamp: -1 });

module.exports = mongoose.model('Alert', alertSchema);
