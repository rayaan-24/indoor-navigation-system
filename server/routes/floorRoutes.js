const express = require('express');
const router = express.Router();
const {
  getFloors,
  getFloorById,
  createFloor,
  updateFloor,
  deleteFloor
} = require('../controllers/floorController');
const { authenticate, authorize } = require('../middleware/auth');

router.route('/')
  .get(getFloors)
  .post(authenticate, authorize('admin'), createFloor);

router.route('/:id')
  .get(getFloorById)
  .put(authenticate, authorize('admin'), updateFloor)
  .delete(authenticate, authorize('admin'), deleteFloor);

module.exports = router;
