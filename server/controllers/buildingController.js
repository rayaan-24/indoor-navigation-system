const Building = require('../models/Building');

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

// @desc    Get single building by ID
// @route   GET /api/buildings/:id
// @access  Public
const getBuildingById = async (req, res, next) => {
  try {
    const building = await Building.findById(req.params.id);
    if (!building) {
      return res.status(404).json({
        success: false,
        message: 'Building not found'
      });
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
// @access  Admin (Mocked for Phase 2)
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
// @access  Admin (Mocked for Phase 2)
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
// @access  Admin (Mocked for Phase 2)
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
  getBuildingById,
  createBuilding,
  updateBuilding,
  deleteBuilding
};
