const Floor = require('../models/Floor');
const Building = require('../models/Building');

// @desc    Get all floors
// @route   GET /api/floors
// @access  Public
const getFloors = async (req, res, next) => {
  try {
    const floors = await Floor.find({ isActive: true }).populate('buildingId', 'name code');
    res.status(200).json({
      success: true,
      data: floors
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get floor by ID
// @route   GET /api/floors/:id
// @access  Public
const getFloorById = async (req, res, next) => {
  try {
    const floor = await Floor.findById(req.params.id).populate('buildingId', 'name code');
    if (!floor) {
      return res.status(404).json({
        success: false,
        message: 'Floor not found'
      });
    }
    res.status(200).json({
      success: true,
      data: floor
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get floors belonging to a building
// @route   GET /api/buildings/:buildingId/floors
// @access  Public
const getFloorsByBuilding = async (req, res, next) => {
  try {
    let building = null;
    if (req.params.buildingId.match(/^[0-9a-fA-F]{24}$/)) {
      building = await Building.findById(req.params.buildingId);
    }
    
    if (!building) {
      // Fallback: try querying by building code string
      const bByCode = await Building.findOne({ code: req.params.buildingId });
      if (!bByCode) {
        return res.status(404).json({
          success: false,
          message: 'Building not found'
        });
      }
      building = bByCode;
    }

    const floors = await Floor.find({ buildingId: building._id, isActive: true }).sort({ floorNumber: 1 });
    res.status(200).json({
      success: true,
      data: floors
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a floor
// @route   POST /api/floors
// @access  Admin
const createFloor = async (req, res, next) => {
  try {
    const floor = await Floor.create(req.body);
    res.status(201).json({
      success: true,
      data: floor,
      message: 'Floor created successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a floor
// @route   PUT /api/floors/:id
// @access  Admin
const updateFloor = async (req, res, next) => {
  try {
    const floor = await Floor.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!floor) {
      return res.status(404).json({
        success: false,
        message: 'Floor not found'
      });
    }
    res.status(200).json({
      success: true,
      data: floor,
      message: 'Floor updated successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a floor
// @route   DELETE /api/floors/:id
// @access  Admin
const deleteFloor = async (req, res, next) => {
  try {
    const floor = await Floor.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
    if (!floor) {
      return res.status(404).json({
        success: false,
        message: 'Floor not found'
      });
    }
    res.status(200).json({
      success: true,
      message: 'Floor deactivated successfully'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getFloors,
  getFloorById,
  getFloorsByBuilding,
  createFloor,
  updateFloor,
  deleteFloor
};
