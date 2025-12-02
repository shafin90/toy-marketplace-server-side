const express = require('express');
const PurchaseController = require('../controllers/PurchaseController');

const router = express.Router();

router.post('/purchase/money', PurchaseController.purchaseWithMoney);
router.post('/purchase/confirm', PurchaseController.confirmMoneyPurchase);

module.exports = router;

