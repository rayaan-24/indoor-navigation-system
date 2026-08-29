const Route = require('../models/Route');

// @desc    Get all routes (supports finding by source & destination)
// @route   GET /api/routes
// @access  Public
const getRoutes = async (req, res, next) => {
  try {
    const { from, to } = req.query;
    
    // Check if searching for a specific route match
    if (from && to) {
      const route = await Route.findOne({ 
        fromLocationId: from, 
        toLocationId: to,
        isActive: true 
      });
      
      if (!route) {
        return res.status(404).json({
          success: false,
          message: 'Pre-calculated route not found'
        });
      }
      
      return res.status(200).json({
        success: true,
        data: route
      });
    }

    const routes = await Route.find({ isActive: true });
    res.status(200).json({
      success: true,
      data: routes
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single route by ID
// @route   GET /api/routes/:id
// @access  Public
const getRouteById = async (req, res, next) => {
  try {
    const route = await Route.findById(req.params.id);
    if (!route) {
      return res.status(404).json({
        success: false,
        message: 'Route not found'
      });
    }
    res.status(200).json({
      success: true,
      data: route
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a route
// @route   POST /api/routes
// @access  Admin
const createRoute = async (req, res, next) => {
  try {
    const route = await Route.create(req.body);
    res.status(201).json({
      success: true,
      data: route,
      message: 'Route created successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a route
// @route   PUT /api/routes/:id
// @access  Admin
const updateRoute = async (req, res, next) => {
  try {
    const route = await Route.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!route) {
      return res.status(404).json({
        success: false,
        message: 'Route not found'
      });
    }
    res.status(200).json({
      success: true,
      data: route,
      message: 'Route updated successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a route
// @route   DELETE /api/routes/:id
// @access  Admin
const deleteRoute = async (req, res, next) => {
  try {
    const route = await Route.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
    if (!route) {
      return res.status(404).json({
        success: false,
        message: 'Route not found'
      });
    }
    res.status(200).json({
      success: true,
      message: 'Route deactivated successfully'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getRoutes,
  getRouteById,
  createRoute,
  updateRoute,
  deleteRoute
};
