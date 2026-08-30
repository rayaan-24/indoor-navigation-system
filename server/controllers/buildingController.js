const Building = require('../models/Building');
const Corridor = require('../models/Corridor');
const Stair = require('../models/Stair');
const Lift = require('../models/Lift');
const Exit = require('../models/Exit');
const Door = require('../models/Door');
const Waypoint = require('../models/Waypoint');
const Room = require('../models/Room');
const Hazard = require('../models/Hazard');

// @desc    Get all buildings
// @route   GET /api/buildings
// @access  Public
const getBuildings = async (req, res, next) => {
  try {
    const buildings = await Building.find({ isActive: true });
    res.status(200).json({
      success: true,
      data: buildings,
      message: 'Buildings retrieved successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get complete metric layout for a building
// @route   GET /api/buildings/:buildingId/layout
// @access  Public
const getBuildingLayout = async (req, res, next) => {
  try {
    let building = null;
    if (req.params.buildingId.match(/^[0-9a-fA-F]{24}$/)) {
      building = await Building.findById(req.params.buildingId);
    }
    if (!building) {
      // try querying by code
      building = await Building.findOne({ code: req.params.buildingId });
      if (!building) {
        return res.status(404).json({
          success: false,
          message: 'Building not found'
        });
      }
    }

    const bId = building._id;
    const [rooms, corridors, stairs, lifts, exits, doors, waypoints, hazards] = await Promise.all([
      Room.find({ buildingId: bId, isActive: true }),
      Corridor.find({ buildingId: bId }),
      Stair.find({ buildingId: bId }),
      Lift.find({ buildingId: bId }),
      Exit.find({ buildingId: bId }),
      Door.find({ buildingId: bId }),
      Waypoint.find({ buildingId: bId }),
      Hazard.find({ isActive: true })
    ]);

    res.status(200).json({
      success: true,
      data: {
        building,
        rooms,
        corridors,
        stairs,
        lifts,
        exits,
        doors,
        waypoints,
        hazards
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single building by ID
// @route   GET /api/buildings/:id
// @access  Public
const getBuildingById = async (req, res, next) => {
  try {
    let building = null;
    if (req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      building = await Building.findById(req.params.id);
    }
    
    if (!building) {
      building = await Building.findOne({ code: req.params.id });
      if (!building) {
        return res.status(404).json({
          success: false,
          message: 'Building not found'
        });
      }
    }
    res.status(200).json({
      success: true,
      data: building
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a building
// @route   POST /api/buildings
// @access  Admin
const createBuilding = async (req, res, next) => {
  try {
    const building = await Building.create(req.body);
    res.status(201).json({
      success: true,
      data: building,
      message: 'Building created successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update building by ID
// @route   PUT /api/buildings/:id
// @access  Admin
const updateBuilding = async (req, res, next) => {
  try {
    const building = await Building.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!building) {
      return res.status(404).json({
        success: false,
        message: 'Building not found'
      });
    }
    res.status(200).json({
      success: true,
      data: building,
      message: 'Building updated successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete building by ID
// @route   DELETE /api/buildings/:id
// @access  Admin
const deleteBuilding = async (req, res, next) => {
  try {
    const building = await Building.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
    if (!building) {
      return res.status(404).json({
        success: false,
        message: 'Building not found'
      });
    }
    res.status(200).json({
      success: true,
      message: 'Building deactivated successfully'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getBuildings,
  getBuildingLayout,
  getBuildingById,
  createBuilding,
  updateBuilding,
  deleteBuilding
};
