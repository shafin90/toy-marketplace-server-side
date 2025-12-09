const PurchaseService = require('../services/PurchaseService');

const PurchaseController = {
    purchaseWithMoney: async (req, res) => {
        try {
            const { toyId, buyerEmail, paymentDetails } = req.body;
            const result = await PurchaseService.purchaseWithMoney(toyId, buyerEmail, paymentDetails);
            res.send(result);
        } catch (error) {
            res.status(400).send({ message: error.message });
        }
    },

    purchaseWithCoins: async (req, res) => {
        try {
            const { toyId, buyerEmail } = req.body;
            const result = await PurchaseService.purchaseWithCoins(toyId, buyerEmail);
            res.send(result);
        } catch (error) {
            res.status(400).send({ message: error.message });
        }
    },

    confirmMoneyPurchase: async (req, res) => {
        try {
            const { toyId, buyerEmail, paymentIntentId } = req.body;
            const result = await PurchaseService.confirmMoneyPurchase(toyId, buyerEmail, paymentIntentId);
            res.send(result);
        } catch (error) {
            res.status(400).send({ message: error.message });
        }
    }
};

module.exports = PurchaseController;

