const express = require('express');
const router = express.Router();
const { searchLocations } = require('../controllers/searchController');

router.get('/', searchLocations);

module.exports = router;
