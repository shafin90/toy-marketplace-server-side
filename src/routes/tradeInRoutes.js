const express = require('express');
const router = express.Router();
const TradeInCalculatorController = require('../controllers/TradeInCalculatorController');

// Trade-in calculator routes
router.post('/trade-in/calculate', TradeInCalculatorController.calculateValue);
router.get('/trade-in/condition-multipliers', TradeInCalculatorController.getConditionMultipliers);

module.exports = router;

