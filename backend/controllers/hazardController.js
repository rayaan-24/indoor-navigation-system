const Hazard = require('../models/Hazard');

// @desc    Get active hazards
// @route   GET /api/hazards
// @access  Public
const getHazards = async (req, res, next) => {
  try {
    const hazards = await Hazard.find({ isActive: true });
    res.status(200).json({
      success: true,
      data: hazards
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create/Activate a simulated hazard
// @route   POST /api/hazards
// @access  Admin
const createHazard = async (req, res, next) => {
  try {
    const { type, locationId, x, y, radius, weight } = req.body;

    if (!type || !locationId) {
      return res.status(400).json({
        success: false,
        message: 'Hazard type and location elements are required.'
      });
    }

    const hazard = await Hazard.create({
      type,
      locationId,
      x,
      y,
      radius,
      weight,
      isActive: true
    });

    res.status(201).json({
      success: true,
      data: hazard,
      message: 'Simulated emergency hazard activated successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Deactivate/Clear a hazard
// @route   DELETE /api/hazards/:id
// @access  Admin
const deleteHazard = async (req, res, next) => {
  try {
    const hazard = await Hazard.findById(req.params.id);

    if (!hazard) {
      return res.status(404).json({
        success: false,
        message: 'Hazard not found'
      });
    }

    await hazard.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Emergency hazard cleared successfully'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getHazards,
  createHazard,
  deleteHazard
};
