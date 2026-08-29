const express = require('express');
const router = express.Router();
const {
  getHistory,
  createHistory
} = require('../controllers/historyController');

router.route('/')
  .get(getHistory)
  .post(createHistory);

module.exports = router;
