const express = require('express');
const router = express.Router();
const { getRoute, evacuateRoute } = require('../controllers/navigationController');

router.post('/route', getRoute);
router.post('/evacuate', evacuateRoute);

module.exports = router;
