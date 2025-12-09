const express = require('express');
const router = express.Router();
const SustainabilityController = require('../controllers/SustainabilityController');

// Sustainability routes
router.get('/sustainability/:userEmail', SustainabilityController.getUserStats);
router.get('/sustainability/global/stats', SustainabilityController.getGlobalStats);

module.exports = router;

