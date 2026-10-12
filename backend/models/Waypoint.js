const mongoose = require('mongoose');

const waypointSchema = new mongoose.Schema(
  {
    buildingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Building',
      required: true
    },
    floorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Floor',
      required: true
    },
    waypointId: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    x: { type: Number, required: true },
    y: { type: Number, required: true },
    label: {
      type: String,
      trim: true
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Waypoint', waypointSchema);
