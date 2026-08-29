const mongoose = require('mongoose');

const routeSchema = new mongoose.Schema(
  {
    buildingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Building'
    },
    fromLocationId: {
      type: String,
      required: [true, 'Source location ID is required']
    },
    toLocationId: {
      type: String,
      required: [true, 'Destination location ID is required']
    },
    distance: {
      type: Number,
      required: [true, 'Distance in meters is required']
    },
    duration: {
      type: Number,
      required: [true, 'Duration in minutes is required']
    },
    steps: [
      {
        instruction: { type: String, required: true },
        type: { 
          type: String, 
          enum: ['straight', 'turn-left', 'turn-right', 'up-stairs', 'down-stairs', 'elevator', 'destination'],
          default: 'straight' 
        },
        floor: { type: Number }
      }
    ],
    pathPoints: {
      type: mongoose.Schema.Types.Mixed // Map: floor number -> [{x, y}, ...]
    },
    isAccessible: {
      type: Boolean,
      default: true
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);

// Compiling unique index on route points combination
routeSchema.index({ fromLocationId: 1, toLocationId: 1 }, { unique: true });

module.exports = mongoose.model('Route', routeSchema);
