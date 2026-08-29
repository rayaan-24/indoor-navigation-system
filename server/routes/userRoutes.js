const express = require('express');
const router = express.Router();
const { getUsers, updateUser, deleteUser } = require('../controllers/userController');
const { authenticate, authorize } = require('../middleware/auth');

router.route('/')
  .get(authenticate, authorize('admin'), getUsers);

router.route('/:id')
  .put(authenticate, authorize('admin'), updateUser)
  .delete(authenticate, authorize('admin'), deleteUser);

module.exports = router;
