const express = require('express');
const router = express.Router();
const BulkExchangeController = require('../controllers/BulkExchangeController');

// Bulk exchange routes
router.post('/bulk-exchange', BulkExchangeController.createBulkExchange);

module.exports = router;

