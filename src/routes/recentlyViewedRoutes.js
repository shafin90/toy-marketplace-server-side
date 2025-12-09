const express = require('express');
const router = express.Router();
const RecentlyViewedController = require('../controllers/RecentlyViewedController');

// Recently viewed routes
router.post('/recently-viewed', RecentlyViewedController.addView);
router.get('/recently-viewed/:userEmail', RecentlyViewedController.getUserRecentlyViewed);
router.delete('/recently-viewed', RecentlyViewedController.clearHistory);

module.exports = router;

