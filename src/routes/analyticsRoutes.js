const express = require('express');
const AnalyticsController = require('../controllers/AnalyticsController');

const router = express.Router();

router.get('/analytics/shop/:email', AnalyticsController.getShopAnalytics);
router.get('/analytics/shop/:email/trend', AnalyticsController.getSalesTrend);

module.exports = router;

