const PriceAlertModel = require('../models/PriceAlertModel');
const ToyModel = require('../models/ToyModel');
const NotificationService = require('./NotificationService');

const PriceAlertService = {
    createAlert: async (userEmail, toyId, targetPrice) => {
        const toy = await ToyModel.findById(toyId);
        if (!toy) {
            throw new Error('Toy not found');
        }

        return await PriceAlertModel.create({
            userEmail,
            toyId,
            targetPrice: targetPrice || toy.offerPrice || toy.price,
            currentPrice: toy.offerPrice || toy.price
        });
    },

    getUserAlerts: async (userEmail) => {
        const alerts = await PriceAlertModel.findByUser(userEmail);
        
        // Populate toy details
        const alertsWithToys = await Promise.all(
            alerts.map(async (alert) => {
                const toy = await ToyModel.findById(alert.toyId);
                return {
                    ...alert,
                    toy: toy || null
                };
            })
        );

        return alertsWithToys.filter(alert => alert.toy !== null);
    },

    checkPriceDrops: async (toyId) => {
        const toy = await ToyModel.findById(toyId);
        if (!toy) return;

        const alerts = await PriceAlertModel.findByToy(toyId);
        const currentPrice = toy.offerPrice || toy.price;

        for (const alert of alerts) {
            if (currentPrice <= alert.targetPrice && !alert.notified) {
                // Price dropped to target or below
                await NotificationService.notifyPriceDrop(alert.userEmail, toy);
                await PriceAlertModel.markAsNotified(alert._id);
            }
        }
    },

    deleteAlert: async (alertId, userEmail) => {
        return await PriceAlertModel.delete(alertId, userEmail);
    }
};

module.exports = PriceAlertService;

