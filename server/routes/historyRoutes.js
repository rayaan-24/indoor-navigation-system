const express = require('express');
const router = express.Router();
const {
  getHistory,
  createHistory,
  clearHistory,
  getAnalytics
} = require('../controllers/historyController');
const { authenticate } = require('../middleware/auth');

router.get('/analytics', authenticate, getAnalytics);

router.route('/')
  .get(authenticate, getHistory)
  .post(authenticate, createHistory)
  .delete(authenticate, clearHistory);

module.exports = router;
