const express = require('express');
const SwapController = require('../controllers/SwapController');

const router = express.Router();

router.post('/swap', SwapController.swapToy);

module.exports = router;
