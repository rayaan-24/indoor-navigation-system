const express = require('express');
const router = express.Router();
const {
  getRooms,
  getRoomById,
  createRoom,
  updateRoom,
  deleteRoom
} = require('../controllers/roomController');
const { authenticate, authorize } = require('../middleware/auth');

router.route('/')
  .get(getRooms)
  .post(authenticate, authorize('admin'), createRoom);

router.route('/:id')
  .get(getRoomById)
  .put(authenticate, authorize('admin'), updateRoom)
  .delete(authenticate, authorize('admin'), deleteRoom);

module.exports = router;
