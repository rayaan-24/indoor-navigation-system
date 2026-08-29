const express = require('express');
const router = express.Router();
const {
  getLandmarks,
  getLandmarkById,
  createLandmark,
  updateLandmark,
  deleteLandmark
} = require('../controllers/landmarkController');
const { authenticate, authorize } = require('../middleware/auth');

router.route('/')
  .get(getLandmarks)
  .post(authenticate, authorize('admin'), createLandmark);

router.route('/:id')
  .get(getLandmarkById)
  .put(authenticate, authorize('admin'), updateLandmark)
  .delete(authenticate, authorize('admin'), deleteLandmark);

module.exports = router;
