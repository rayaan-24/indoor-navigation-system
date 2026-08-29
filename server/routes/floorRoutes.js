const express = require('express');
const router = express.Router();
const {
  getFloors,
  getFloorById,
  createFloor,
  updateFloor,
  deleteFloor
} = require('../controllers/floorController');

router.route('/')
  .get(getFloors)
  .post(createFloor);

router.route('/:id')
  .get(getFloorById)
  .put(updateFloor)
  .delete(deleteFloor);

module.exports = router;
