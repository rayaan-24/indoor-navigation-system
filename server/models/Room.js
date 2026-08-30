const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema(
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
    roomNumber: {
      type: String,
      required: [true, 'Room number is required'],
      trim: true
    },
    name: {
      type: String,
      required: [true, 'Room name is required'],
      trim: true
    },
    roomType: {
      type: String,
      enum: ['Classroom', 'Laboratory', 'Department', 'Office', 'Seminar Hall', 'Library', 'Facility', 'Cafeteria', 'Restroom', 'Elevator', 'Staircase', 'Exit', 'Emergency', 'Other'],
      default: 'Classroom'
    },
    department: {
      type: String,
      trim: true
    },
    description: {
      type: String,
      trim: true
    },
    capacity: {
      type: String,
      trim: true
    },
    width: {
      type: Number
    },
    height: {
      type: Number
    },
    areaSqft: {
      type: Number
    },
    areaSqm: {
      type: Number
    },
    coordinates: {
      x: { type: Number, required: true },
      y: { type: Number, required: true }
    },
    facilities: [
      {
        type: String,
        trim: true
      }
    ],
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

module.exports = mongoose.model('Room', roomSchema);
