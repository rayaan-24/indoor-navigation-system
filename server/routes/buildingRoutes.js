const express = require('express');
const router = express.Router();
const {
  getBuildings,
  getBuildingById,
  createBuilding,
  updateBuilding,
  deleteBuilding
} = require('../controllers/buildingController');

router.route('/')
  .get(getBuildings)
  .post(createBuilding);

router.route('/:id')
  .get(getBuildingById)
  .put(updateBuilding)
  .delete(deleteBuilding);

module.exports = router;
