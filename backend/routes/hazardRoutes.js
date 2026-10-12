const express = require('express');
const router = express.Router();
const { getHazards, createHazard, deleteHazard } = require('../controllers/hazardController');

router.get('/', getHazards);
router.post('/', createHazard);
router.delete('/:id', deleteHazard);

module.exports = router;
