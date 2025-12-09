const DeliveryService = require('../services/DeliveryService');

const DeliveryController = {
    createDelivery: async (req, res) => {
        try {
            const { exchangeId } = req.params;
            const deliveryData = req.body;

            if (!exchangeId || !deliveryData.deliveryAddress) {
                return res.status(400).json({ message: 'Exchange ID and delivery address are required' });
            }

            const delivery = await DeliveryService.createDelivery(exchangeId, deliveryData);
            res.status(201).json(delivery);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    },

    assignDeliveryMan: async (req, res) => {
        try {
            const { deliveryId } = req.params;
            const { deliveryManEmail } = req.body;

            if (!deliveryId || !deliveryManEmail) {
                return res.status(400).json({ message: 'Delivery ID and delivery man email are required' });
            }

            const delivery = await DeliveryService.assignDeliveryMan(deliveryId, deliveryManEmail);
            res.json(delivery);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    },

    updateStatus: async (req, res) => {
        try {
            const { deliveryId } = req.params;
            const { status, ...updateData } = req.body;

            if (!deliveryId || !status) {
                return res.status(400).json({ message: 'Delivery ID and status are required' });
            }

            const delivery = await DeliveryService.updateStatus(deliveryId, status, updateData);
            res.json(delivery);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    },

    updateTracking: async (req, res) => {
        try {
            const { deliveryId } = req.params;
            const trackingData = req.body;

            if (!deliveryId) {
                return res.status(400).json({ message: 'Delivery ID is required' });
            }

            const delivery = await DeliveryService.updateTracking(deliveryId, trackingData);
            res.json(delivery);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    },

    getDeliveryByExchange: async (req, res) => {
        try {
            const { exchangeId } = req.params;

            const delivery = await DeliveryService.getDeliveryByExchange(exchangeId);
            if (!delivery) {
                return res.status(404).json({ message: 'Delivery not found' });
            }

            res.json(delivery);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    getUserDeliveries: async (req, res) => {
        try {
            const { userEmail } = req.user || { userEmail: req.params.userEmail };

            if (!userEmail) {
                return res.status(400).json({ message: 'User email is required' });
            }

            const deliveries = await DeliveryService.getUserDeliveries(userEmail);
            res.json(deliveries);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    getDeliveryManDeliveries: async (req, res) => {
        try {
            const { deliveryManEmail } = req.params;

            if (!deliveryManEmail) {
                return res.status(400).json({ message: 'Delivery man email is required' });
            }

            const deliveries = await DeliveryService.getDeliveryManDeliveries(deliveryManEmail);
            res.json(deliveries);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
};

module.exports = DeliveryController;

