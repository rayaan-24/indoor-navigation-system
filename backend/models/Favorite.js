const mongoose = require('mongoose');

const favoriteSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required']
    },
    locationId: {
      type: String,
      required: [true, 'Location reference ID is required']
    },
    locationType: {
      type: String,
      enum: ['Room', 'Landmark'],
      default: 'Room'
    }
  },
  { timestamps: true }
);

// Prevent duplicate favorites for the same user/location
favoriteSchema.index({ userId: 1, locationId: 1 }, { unique: true });

module.exports = mongoose.model('Favorite', favoriteSchema);
