const Connection = require('../models/Connection');

// @desc    Get all connections (edges)
// @route   GET /api/connections
// @access  Public
const getConnections = async (req, res, next) => {
  try {
    const connections = await Connection.find({});
    res.status(200).json({
      success: true,
      data: connections,
      message: 'Connections retrieved successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new connection
// @route   POST /api/connections
// @access  Admin
const createConnection = async (req, res, next) => {
  try {
    const { fromNode, toNode, distance, type, isActive, accessibility, floor, pathPoints } = req.body;

    if (!fromNode || !toNode || distance === undefined || floor === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Please provide fromNode, toNode, distance, and floor level.'
      });
    }

    if (fromNode === toNode) {
      return res.status(400).json({
        success: false,
        message: 'Source and destination nodes cannot be identical.'
      });
    }

    // Check if duplicate connection exists
    const duplicate = await Connection.findOne({
      $or: [
        { fromNode, toNode },
        { fromNode: toNode, toNode: fromNode }
      ]
    });

    if (duplicate) {
      return res.status(409).json({
        success: false,
        message: 'A connection between these two nodes already exists.'
      });
    }

    const connection = await Connection.create(req.body);

    res.status(201).json({
      success: true,
      data: connection,
      message: 'Connection edge created successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a connection by ID
// @route   PUT /api/connections/:id
// @access  Admin
const updateConnection = async (req, res, next) => {
  try {
    const connection = await Connection.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    if (!connection) {
      return res.status(404).json({
        success: false,
        message: 'Connection edge not found'
      });
    }

    res.status(200).json({
      success: true,
      data: connection,
      message: 'Connection edge updated successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a connection by ID
// @route   DELETE /api/connections/:id
// @access  Admin
const deleteConnection = async (req, res, next) => {
  try {
    const connection = await Connection.findByIdAndDelete(req.params.id);

    if (!connection) {
      return res.status(404).json({
        success: false,
        message: 'Connection edge not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Connection edge deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getConnections,
  createConnection,
  updateConnection,
  deleteConnection
};
