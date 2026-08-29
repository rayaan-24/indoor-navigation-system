const mongoose = require('mongoose');

const floorSchema = new mongoose.Schema(
  {
    buildingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Building',
      required: [true, 'Building reference is required']
    },
    name: {
      type: String,
      required: [true, 'Floor name is required'],
      trim: true
    },
    floorNumber: {
      type: Number,
      required: [true, 'Floor number is required']
    },
    floorCode: {
      type: String,
      required: [true, 'Floor code is required'],
      trim: true
    },
    description: {
      type: String,
      trim: true
    },
    mapData: {
      type: mongoose.Schema.Types.Mixed // For storing SVG structures or grid settings
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);

// Unique index on floorCode and buildingId combination
floorSchema.index({ buildingId: 1, floorCode: 1 }, { unique: true });

module.exports = mongoose.model('Floor', floorSchema);
