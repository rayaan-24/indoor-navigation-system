const History = require('../models/History');

// @desc    Get user navigation history
// @route   GET /api/history
// @access  Public
const getHistory = async (req, res, next) => {
  try {
    const { userId } = req.query;
    let query = {};
    if (userId && userId.match(/^[0-9a-fA-F]{24}$/)) {
      query.userId = userId;
    }
    const history = await History.find(query).sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      data: history
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Log a navigation route request
// @route   POST /api/history
// @access  Public
const createHistory = async (req, res, next) => {
  try {
    const { userId, source, destination, distance, estimatedTime } = req.body;
    const historyItem = await History.create({
      userId,
      source,
      destination,
      distance,
      estimatedTime
    });
    res.status(201).json({
      success: true,
      data: historyItem,
      message: 'Navigation activity logged'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getHistory,
  createHistory
};
