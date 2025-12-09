const express = require('express');
const router = express.Router();
const DeliveryController = require('../controllers/DeliveryController');

// Delivery routes
router.post('/delivery/:exchangeId', DeliveryController.createDelivery);
router.put('/delivery/:deliveryId/assign', DeliveryController.assignDeliveryMan);
router.put('/delivery/:deliveryId/status', DeliveryController.updateStatus);
router.put('/delivery/:deliveryId/tracking', DeliveryController.updateTracking);
router.get('/delivery/exchange/:exchangeId', DeliveryController.getDeliveryByExchange);
router.get('/delivery/user/:userEmail', DeliveryController.getUserDeliveries);
router.get('/delivery/delivery-man/:deliveryManEmail', DeliveryController.getDeliveryManDeliveries);

module.exports = router;

