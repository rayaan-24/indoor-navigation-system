const express = require('express');
const router = express.Router();
const {
  getLandmarks,
  getLandmarkById,
  createLandmark,
  updateLandmark,
  deleteLandmark
} = require('../controllers/landmarkController');

router.route('/')
  .get(getLandmarks)
  .post(createLandmark);

router.route('/:id')
  .get(getLandmarkById)
  .put(updateLandmark)
  .delete(deleteLandmark);

module.exports = router;
