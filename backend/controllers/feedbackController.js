const Feedback = require('../models/Feedback');

// @desc    Get all feedback tickets
// @route   GET /api/feedback
// @access  Public (Admin restrictions added in Phase 3)
const getFeedback = async (req, res, next) => {
  try {
    const feedback = await Feedback.find().sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      data: feedback
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single feedback by ID
// @route   GET /api/feedback/:id
// @access  Public
const getFeedbackById = async (req, res, next) => {
  try {
    const ticket = await Feedback.findById(req.params.id);
    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Feedback ticket not found'
      });
    }
    res.status(200).json({
      success: true,
      data: ticket
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Submit a feedback / issue ticket
// @route   POST /api/feedback
// @access  Public
const createFeedback = async (req, res, next) => {
  try {
    const ticket = await Feedback.create(req.body);
    res.status(201).json({
      success: true,
      data: ticket,
      message: 'Feedback submitted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update feedback status (e.g. resolve)
// @route   PUT /api/feedback/:id
// @access  Admin
const updateFeedback = async (req, res, next) => {
  try {
    const ticket = await Feedback.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Feedback ticket not found'
      });
    }
    res.status(200).json({
      success: true,
      data: ticket,
      message: 'Feedback status updated successfully'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getFeedback,
  getFeedbackById,
  createFeedback,
  updateFeedback
};
