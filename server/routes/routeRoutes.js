const express = require('express');
const router = express.Router();
const {
  getRoutes,
  getRouteById,
  createRoute,
  updateRoute,
  deleteRoute
} = require('../controllers/routeController');
const { authenticate, authorize } = require('../middleware/auth');

router.route('/')
  .get(authenticate, authorize('admin'), getRoutes)
  .post(authenticate, authorize('admin'), createRoute);

router.route('/:id')
  .get(getRouteById)
  .put(authenticate, authorize('admin'), updateRoute)
  .delete(authenticate, authorize('admin'), deleteRoute);

module.exports = router;
