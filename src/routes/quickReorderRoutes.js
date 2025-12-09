const express = require('express');
const router = express.Router();
const QuickReorderController = require('../controllers/QuickReorderController');

// Quick reorder routes
router.get('/quick-reorder/:userEmail', QuickReorderController.getReorderItems);
router.get('/quick-reorder/check', QuickReorderController.canReorder);

module.exports = router;

