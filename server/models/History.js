const mongoose = require('mongoose');

const historySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required']
    },
    source: {
      type: String,
      required: [true, 'Source location is required']
    },
    destination: {
      type: String,
      required: [true, 'Destination location is required']
    },
    distance: {
      type: Number
    },
    estimatedTime: {
      type: Number
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('History', historySchema);
