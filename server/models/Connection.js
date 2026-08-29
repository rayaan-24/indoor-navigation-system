const mongoose = require('mongoose');

const connectionSchema = new mongoose.Schema(
  {
    fromNode: {
      type: String,
      required: [true, 'Source node ID is required'],
      trim: true
    },
    toNode: {
      type: String,
      required: [true, 'Destination node ID is required'],
      trim: true
    },
    distance: {
      type: Number,
      required: [true, 'Weight distance in meters is required']
    },
    type: {
      type: String,
      enum: ['corridor', 'stairs', 'elevator', 'door', 'ramp'],
      default: 'corridor'
    },
    isActive: {
      type: Boolean,
      default: true
    },
    accessibility: {
      type: Boolean,
      default: true
    },
    floor: {
      type: Number,
      required: [true, 'Floor index context is required']
    },
    pathPoints: [
      {
        x: { type: Number, required: true },
        y: { type: Number, required: true }
      }
    ]
  },
  { timestamps: true }
);

// Prevent duplicate undirected edges in graph definitions
connectionSchema.index({ fromNode: 1, toNode: 1 }, { unique: true });

module.exports = mongoose.model('Connection', connectionSchema);
