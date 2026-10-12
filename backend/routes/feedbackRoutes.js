const express = require('express');
const router = express.Router();
const {
  getFeedback,
  getFeedbackById,
  createFeedback,
  updateFeedback
} = require('../controllers/feedbackController');
const { authenticate, authorize } = require('../middleware/auth');

router.route('/')
  .get(authenticate, authorize('admin'), getFeedback)
  .post(authenticate, createFeedback);

router.route('/:id')
  .get(authenticate, authorize('admin'), getFeedbackById)
  .put(authenticate, authorize('admin'), updateFeedback);

module.exports = router;
