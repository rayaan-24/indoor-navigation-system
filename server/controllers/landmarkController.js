const Landmark = require('../models/Landmark');
const Floor = require('../models/Floor');

// @desc    Get all landmarks
// @route   GET /api/landmarks
// @access  Public
const getLandmarks = async (req, res, next) => {
  try {
    const landmarks = await Landmark.find({ isActive: true })
      .populate('buildingId', 'name code')
      .populate('floorId', 'name floorCode');
    res.status(200).json({
      success: true,
      data: landmarks
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single landmark by ID
// @route   GET /api/landmarks/:id
// @access  Public
const getLandmarkById = async (req, res, next) => {
  try {
    const landmark = await Landmark.findById(req.params.id)
      .populate('buildingId', 'name code')
      .populate('floorId', 'name floorCode');
    if (!landmark) {
      return res.status(404).json({
        success: false,
        message: 'Landmark not found'
      });
    }
    res.status(200).json({
      success: true,
      data: landmark
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get landmarks by Floor ID
// @route   GET /api/floors/:floorId/landmarks
// @access  Public
const getLandmarksByFloor = async (req, res, next) => {
  try {
    let floorQuery = req.params.floorId;
    let query = { isActive: true };

    if (floorQuery.match(/^[0-9a-fA-F]{24}$/)) {
      query.floorId = floorQuery;
    } else {
      const fl = await Floor.findOne({ floorCode: floorQuery });
      if (!fl) {
        return res.status(404).json({
          success: false,
          message: 'Floor not found'
        });
      }
      query.floorId = fl._id;
    }

    const landmarks = await Landmark.find(query);
    res.status(200).json({
      success: true,
      data: landmarks
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a landmark
// @route   POST /api/landmarks
// @access  Admin
const createLandmark = async (req, res, next) => {
  try {
    const landmark = await Landmark.create(req.body);
    res.status(201).json({
      success: true,
      data: landmark,
      message: 'Landmark created successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a landmark
// @route   PUT /api/landmarks/:id
// @access  Admin
const updateLandmark = async (req, res, next) => {
  try {
    const landmark = await Landmark.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!landmark) {
      return res.status(404).json({
        success: false,
        message: 'Landmark not found'
      });
    }
    res.status(200).json({
      success: true,
      data: landmark,
      message: 'Landmark updated successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a landmark
// @route   DELETE /api/landmarks/:id
// @access  Admin
const deleteLandmark = async (req, res, next) => {
  try {
    const landmark = await Landmark.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
    if (!landmark) {
      return res.status(404).json({
        success: false,
        message: 'Landmark not found'
      });
    }
    res.status(200).json({
      success: true,
      message: 'Landmark deactivated successfully'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getLandmarks,
  getLandmarkById,
  getLandmarksByFloor,
  createLandmark,
  updateLandmark,
  deleteLandmark
};
