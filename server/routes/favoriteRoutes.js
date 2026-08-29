const express = require('express');
const router = express.Router();
const {
  getFavorites,
  createFavorite,
  deleteFavorite
} = require('../controllers/favoriteController');

router.route('/')
  .get(getFavorites)
  .post(createFavorite);

router.route('/:id')
  .delete(deleteFavorite);

module.exports = router;
