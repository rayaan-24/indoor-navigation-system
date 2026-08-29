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
    isActive: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Building', buildingSchema);
