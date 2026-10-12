const mongoose = require('mongoose');

const sensorMapSchema = new mongoose.Schema(
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
    sensorId: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    elementId: {
      type: String,
      required: true,
      trim: true
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('SensorMap', sensorMapSchema);
