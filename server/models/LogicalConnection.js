const mongoose = require('mongoose');

const logicalConnectionSchema = new mongoose.Schema(
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
    type: {
      type: String,
      enum: ['room_to_corridor', 'corridor_to_corridor', 'corridor_to_vertical_egress', 'stairs_to_exits'],
      required: true
    },
    fromId: {
      type: String,
      required: true,
      trim: true
    },
    toId: {
      type: String,
      required: true,
      trim: true
    },
    doorId: {
      type: String,
      trim: true
    },
    waypointId: {
      type: String,
      trim: true
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('LogicalConnection', logicalConnectionSchema);
