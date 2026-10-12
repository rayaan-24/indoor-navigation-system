const mongoose = require('mongoose');

const doorSchema = new mongoose.Schema(
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
    doorId: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    roomId: {
      type: String,
      required: true,
      trim: true
    },
    corridorId: {
      type: String,
      required: true,
      trim: true
    },
    x: { type: Number, required: true },
    y: { type: Number, required: true },
    width: { type: Number, required: true },
    height: { type: Number, required: true },
    orientation: {
      type: String,
      enum: ['horizontal', 'vertical'],
      required: true
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Door', doorSchema);
