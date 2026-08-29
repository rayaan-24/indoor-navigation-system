const express = require('express');
const router = express.Router();
const {
  getHistory,
  createHistory
} = require('../controllers/historyController');
const { authenticate } = require('../middleware/auth');

router.route('/')
  .get(authenticate, getHistory)
  .post(authenticate, createHistory);

module.exports = router;
