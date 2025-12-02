const express = require('express');
const TransactionController = require('../controllers/TransactionController');

const router = express.Router();

router.get('/transactions/:email', TransactionController.getUserTransactions);
router.get('/transactions/:email/coins', TransactionController.getCoinTransactions);
router.get('/transactions/:email/purchases', TransactionController.getPurchaseHistory);

module.exports = router;

