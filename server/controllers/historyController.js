const History = require('../models/History');

// @desc    Get user navigation history
// @route   GET /api/history
// @access  Private
const getHistory = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const history = await History.find({ userId }).sort({ createdAt: -1 });
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
// @access  Private
const createHistory = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { source, destination, distance, estimatedTime } = req.body;

    if (!source || !destination) {
      return res.status(400).json({
        success: false,
        message: 'Please provide source and destination details.'
      });
    }

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

// @desc    Clear user navigation history
// @route   DELETE /api/history
// @access  Private
const clearHistory = async (req, res, next) => {
  try {
    const userId = req.user._id;
    await History.deleteMany({ userId });
    res.status(200).json({
      success: true,
      message: 'Navigation history cleared successfully'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getHistory,
  createHistory,
  clearHistory
};
