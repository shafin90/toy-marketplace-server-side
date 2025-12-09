const express = require('express');
const ExchangeController = require('../controllers/ExchangeController');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// Create exchange request
router.post('/exchange/request', authenticate, ExchangeController.createExchangeRequest);

// Get exchange requests by shop owner (uses authenticated user's email)
router.get('/exchange/shop-owner', authenticate, ExchangeController.getExchangeRequestsByShopOwner);

// Get exchange requests by user
router.get('/exchange/user/:userEmail', authenticate, ExchangeController.getExchangeRequestsByUser);

// Set discounts (shop owner)
router.put('/exchange/:exchangeId/set-discounts', authenticate, ExchangeController.setDiscounts);

// User accept exchange
router.put('/exchange/:exchangeId/accept', authenticate, ExchangeController.userAcceptExchange);

// User reject exchange
router.put('/exchange/:exchangeId/reject', authenticate, ExchangeController.userRejectExchange);

// Confirm exchange payment (after Stripe payment)
router.post('/exchange/:exchangeId/confirm-payment', authenticate, ExchangeController.confirmExchangePayment);

// Confirm exchange (shop owner - after delivery)
router.put('/exchange/:exchangeId/confirm', authenticate, ExchangeController.confirmExchange);

module.exports = router;

