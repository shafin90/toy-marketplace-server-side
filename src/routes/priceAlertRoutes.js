const express = require('express');
const router = express.Router();
const PriceAlertController = require('../controllers/PriceAlertController');

// Price alert routes
router.post('/price-alerts', PriceAlertController.createAlert);
router.get('/price-alerts/:userEmail', PriceAlertController.getUserAlerts);
router.delete('/price-alerts/:alertId', PriceAlertController.deleteAlert);

module.exports = router;

