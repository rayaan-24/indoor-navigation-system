const Favorite = require('../models/Favorite');

// @desc    Get user favorites
// @route   GET /api/favorites
// @access  Public (Uses userId param or fallback to demo user in Phase 2)
const getFavorites = async (req, res, next) => {
  try {
    const { userId } = req.query;
    let query = {};
    if (userId && userId.match(/^[0-9a-fA-F]{24}$/)) {
      query.userId = userId;
    }
    const favorites = await Favorite.find(query);
    res.status(200).json({
      success: true,
      data: favorites
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add a location to favorites
// @route   POST /api/favorites
// @access  Public
const createFavorite = async (req, res, next) => {
  try {
    const { userId, locationId, locationType } = req.body;
    
    // Check if duplicate exists
    const duplicate = await Favorite.findOne({ userId, locationId });
    if (duplicate) {
      return res.status(409).json({
        success: false,
        message: 'Location is already in favorites'
      });
    }

    const favorite = await Favorite.create({ userId, locationId, locationType });
    res.status(201).json({
      success: true,
      data: favorite,
      message: 'Location added to favorites'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Remove location from favorites
// @route   DELETE /api/favorites/:id
// @access  Public
const deleteFavorite = async (req, res, next) => {
  try {
    // Can delete by Favorite object ID or custom locationId string if matched
    let favorite;
    if (req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      favorite = await Favorite.findByIdAndDelete(req.params.id);
    } else {
      const { userId } = req.query;
      favorite = await Favorite.findOneAndDelete({ userId, locationId: req.params.id });
    }

    if (!favorite) {
      return res.status(404).json({
        success: false,
        message: 'Favorite not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Location removed from favorites'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getFavorites,
  createFavorite,
  deleteFavorite
};
