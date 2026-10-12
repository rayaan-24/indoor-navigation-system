const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Notification title is required'],
      trim: true
    },
    message: {
      type: String,
      required: [true, 'Notification message is required'],
      trim: true
    },
    type: {
      type: String,
      enum: ['maintenance', 'route-update', 'location-update', 'announcement', 'system'],
      default: 'system'
    },
    targetAudience: {
      type: String,
      enum: ['all', 'students', 'staff'],
      default: 'all'
    },
    relatedBuilding: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Building'
    },
    isRead: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Notification', notificationSchema);
