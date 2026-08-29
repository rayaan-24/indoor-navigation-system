const express = require('express');
const router = express.Router();
const {
  getFavorites,
  createFavorite,
  deleteFavorite
} = require('../controllers/favoriteController');
const { authenticate } = require('../middleware/auth');

router.route('/')
  .get(authenticate, getFavorites)
  .post(authenticate, createFavorite);

router.route('/:id')
  .delete(authenticate, deleteFavorite);

module.exports = router;
