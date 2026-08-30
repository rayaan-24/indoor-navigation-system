const mongoose = require('mongoose');

const buildingSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Building name is required'],
      trim: true
    },
    code: {
      type: String,
      required: [true, 'Building code is required'],
      unique: true,
      trim: true,
      lowercase: true
    },
    description: {
      type: String,
      trim: true
    },
    address: {
      type: String,
      trim: true
    },
    numberOfFloors: {
      type: Number,
      default: 1
    },
    numberOfLocations: {
      type: Number,
      default: 0
    },
    facilities: [
      {
        type: String,
        trim: true
      }
    ],
    image: {
      type: String,
      trim: true
    },
    width: {
      type: Number,
      default: 120
    },
    height: {
      type: Number,
      default: 94
    },
    coordinateSystem: {
      type: String,
      default: 'Cartesian top view'
    },
    units: {
      type: String,
      default: 'meters'
    },
    metersPerUnit: {
      type: Number,
      default: 1
    },
    displayScale: {
      type: String,
      default: '1 unit = 1 meter'
    },
    pixelsPerMeter: {
      type: Number,
      default: 12
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Building', buildingSchema);
