const mongoose = require('mongoose');

const landmarkSchema = new mongoose.Schema(
  {
    buildingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Building',
      required: [true, 'Building reference is required']
    },
    floorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Floor',
      required: [true, 'Floor reference is required']
    },
    name: {
      type: String,
      required: [true, 'Landmark name is required'],
      trim: true
    },
    type: {
      type: String,
      enum: ['Staircase', 'Elevator', 'Restroom', 'Entrance', 'Exit', 'Reception', 'Cafeteria', 'Information Desk', 'Other'],
      default: 'Restroom'
    },
    description: {
      type: String,
      trim: true
    },
    coordinates: {
      x: { type: Number, required: true },
      y: { type: Number, required: true }
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

module.exports = mongoose.model('Landmark', landmarkSchema);
