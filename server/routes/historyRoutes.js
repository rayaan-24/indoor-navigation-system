const express = require('express');
const router = express.Router();
const {
  getHistory,
  createHistory,
  clearHistory
} = require('../controllers/historyController');
const { authenticate } = require('../middleware/auth');

router.route('/')
  .get(authenticate, getHistory)
  .post(authenticate, createHistory)
  .delete(authenticate, clearHistory);

module.exports = router;
