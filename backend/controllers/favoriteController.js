const Favorite = require('../models/Favorite');

// @desc    Get user favorites
// @route   GET /api/favorites
// @access  Private
const getFavorites = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const favorites = await Favorite.find({ userId });
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
// @access  Private
const createFavorite = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { locationId, locationType } = req.body;

    if (!locationId || !locationType) {
      return res.status(400).json({
        success: false,
        message: 'Please provide locationId and locationType.'
      });
    }

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
// @access  Private
const deleteFavorite = async (req, res, next) => {
  try {
    const userId = req.user._id;
    let favorite;

    if (req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      favorite = await Favorite.findOneAndDelete({ _id: req.params.id, userId });
    } else {
      favorite = await Favorite.findOneAndDelete({ userId, locationId: req.params.id });
    }

    if (!favorite) {
      return res.status(404).json({
        success: false,
        message: 'Favorite not found or not owned by current profile'
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
