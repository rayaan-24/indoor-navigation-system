const mongoose = require('mongoose');

const hazardSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ['FIRE', 'SMOKE', 'BLOCKAGE', 'CROWD', 'GAS'],
      required: true
    },
    locationId: {
      type: String,
      required: true,
      trim: true
    },
    x: { type: Number },
    y: { type: Number },
    radius: {
      type: Number,
      default: 0
    },
    weight: {
      type: Number,
      default: 1
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Hazard', hazardSchema);
