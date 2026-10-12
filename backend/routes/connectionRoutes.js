const express = require('express');
const router = express.Router();
const {
  getConnections,
  createConnection,
  updateConnection,
  deleteConnection
} = require('../controllers/connectionController');
const { authenticate, authorize } = require('../middleware/auth');

router.route('/')
  .get(getConnections)
  .post(authenticate, authorize('admin'), createConnection);

router.route('/:id')
  .put(authenticate, authorize('admin'), updateConnection)
  .delete(authenticate, authorize('admin'), deleteConnection);

module.exports = router;
