const express = require('express');
const router = express.Router();
const {
  getBuildings,
  getBuildingById,
  createBuilding,
  updateBuilding,
  deleteBuilding
} = require('../controllers/buildingController');
const { authenticate, authorize } = require('../middleware/auth');

router.route('/')
  .get(getBuildings)
  .post(authenticate, authorize('admin'), createBuilding);

router.route('/:id')
  .get(getBuildingById)
  .put(authenticate, authorize('admin'), updateBuilding)
  .delete(authenticate, authorize('admin'), deleteBuilding);

module.exports = router;
