const express = require('express');
const router = express.Router();
const ShopComparisonController = require('../controllers/ShopComparisonController');

// Shop comparison routes
router.post('/shop-comparison', ShopComparisonController.compareShops);
router.get('/shop-comparison/best-deal', ShopComparisonController.findBestDeal);

module.exports = router;

