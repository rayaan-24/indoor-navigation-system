const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false // Optional for anonymous submissions
    },
    issueType: {
      type: String,
      required: [true, 'Issue type is required'],
      enum: [
        'Incorrect room',
        'Incorrect route',
        'Missing location',
        'Blocked path',
        'Incorrect building information',
        'Other',
        'incorrect-room',
        'incorrect-route',
        'missing-location',
        'blocked-path',
        'incorrect-building',
        'other'
      ]
    },
    locationId: {
      type: String,
      required: false
    },
    message: {
      type: String,
      required: [true, 'Message description is required'],
      trim: true
    },
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    status: {
      type: String,
      enum: ['Pending', 'In Progress', 'Resolved', 'pending', 'reviewed', 'resolved'],
      default: 'Pending'
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Feedback', feedbackSchema);
