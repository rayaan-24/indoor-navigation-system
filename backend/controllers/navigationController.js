const { calculateRoute, calculateEvacuationRoute } = require('../services/navigationService');
const Room = require('../models/Room');
const Landmark = require('../models/Landmark');

// @desc    Calculate shortest route between two nodes
// @route   POST /api/navigation/route
// @access  Public
const getRoute = async (req, res, next) => {
  try {
    const { sourceId, destinationId, preferences } = req.body;

    // 1. Check parameter inputs
    if (!sourceId || !destinationId) {
      return res.status(400).json({
        success: false,
        message: 'Please select both a starting location and destination.'
      });
    }

    if (sourceId === destinationId) {
      return res.status(400).json({
        success: false,
        message: 'You are already at this location.'
      });
    }

    // 2. Validate source node existence in database
    const sourceExists = await Room.findOne({ roomNumber: sourceId }) || await Landmark.findById(sourceId) || await Room.findById(sourceId);
    if (!sourceExists) {
      return res.status(404).json({
        success: false,
        message: 'Please select a valid starting location.'
      });
    }

    // 3. Validate destination node existence in database
    const destExists = await Room.findOne({ roomNumber: destinationId }) || await Landmark.findById(destinationId) || await Room.findById(destinationId);
    if (!destExists) {
      return res.status(404).json({
        success: false,
        message: 'Please select a valid destination.'
      });
    }

    // 4. Run Dijkstra graph algorithm path calculations
    const route = await calculateRoute(sourceId, destinationId, preferences);
    
    res.status(200).json({
      success: true,
      data: route.data,
      message: 'Route calculated successfully'
    });
  } catch (error) {
    if (error.message.includes('No available route')) {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }
    next(error);
  }
};

// @desc    Evacuate to the nearest safe exit
// @route   POST /api/navigation/evacuate
// @access  Public
const evacuateRoute = async (req, res, next) => {
  try {
    const { sourceId, preferences } = req.body;

    if (!sourceId) {
      return res.status(400).json({
        success: false,
        message: 'Please select a starting location for evacuation.'
      });
    }

    const sourceExists = await Room.findOne({ roomNumber: sourceId }) || await Landmark.findById(sourceId) || await Room.findById(sourceId);
    if (!sourceExists) {
      return res.status(404).json({
        success: false,
        message: 'Please select a valid starting location.'
      });
    }

    const route = await calculateEvacuationRoute(sourceId, preferences);

    res.status(200).json({
      success: true,
      data: route.data,
      message: 'Evacuation route calculated successfully'
    });
  } catch (error) {
    if (error.message.includes('No safe route')) {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }
    next(error);
  }
};

module.exports = {
  getRoute,
  evacuateRoute
};
