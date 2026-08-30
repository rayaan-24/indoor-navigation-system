const express = require('express');
const router = express.Router();
const {
  getBuildings,
  getBuildingLayout,
  getBuildingById,
  createBuilding,
  updateBuilding,
  deleteBuilding
} = require('../controllers/buildingController');

router.route('/').get(getBuildings).post(createBuilding);
router.route('/:buildingId/layout').get(getBuildingLayout);
router.route('/:id').get(getBuildingById).put(updateBuilding).delete(deleteBuilding);

module.exports = router;
