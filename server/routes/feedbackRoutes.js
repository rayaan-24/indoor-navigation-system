const express = require('express');
const router = express.Router();
const {
  getFeedback,
  getFeedbackById,
  createFeedback,
  updateFeedback
} = require('../controllers/feedbackController');

router.route('/')
  .get(getFeedback)
  .post(createFeedback);

router.route('/:id')
  .get(getFeedbackById)
  .put(updateFeedback);

module.exports = router;
