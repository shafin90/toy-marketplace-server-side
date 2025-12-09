const express = require('express');
const PurchaseController = require('../controllers/PurchaseController');

const router = express.Router();

router.post('/purchase/money', PurchaseController.purchaseWithMoney);
router.post('/purchase/coins', PurchaseController.purchaseWithCoins);
router.post('/purchase/confirm', PurchaseController.confirmMoneyPurchase);

module.exports = router;

