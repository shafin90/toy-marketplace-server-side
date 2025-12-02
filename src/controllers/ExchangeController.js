const ExchangeService = require('../services/ExchangeService');

const ExchangeController = {
    createExchangeRequest: async (req, res) => {
        try {
            const { productId, oldToyIds } = req.body;
            const userId = req.user?.email || req.body.userId;

            if (!productId || !oldToyIds || !Array.isArray(oldToyIds) || oldToyIds.length === 0) {
                return res.status(400).send({ message: 'Product ID and old toy IDs are required' });
            }

            const result = await ExchangeService.createExchangeRequest({
                productId,
                userId,
                oldToyIds
            });

            res.send(result);
        } catch (error) {
            res.status(400).send({ message: error.message });
        }
    },

    getExchangeRequestsByShopOwner: async (req, res) => {
        try {
            const shopOwnerEmail = req.user?.email;
            if (!shopOwnerEmail) {
                return res.status(401).send({ message: 'Unauthorized' });
            }
            const requests = await ExchangeService.getExchangeRequestsByShopOwner(shopOwnerEmail);
            res.send(requests);
        } catch (error) {
            res.status(400).send({ message: error.message });
        }
    },

    getExchangeRequestsByUser: async (req, res) => {
        try {
            const { userEmail } = req.params;
            const requests = await ExchangeService.getExchangeRequestsByUser(userEmail);
            res.send(requests);
        } catch (error) {
            res.status(400).send({ message: error.message });
        }
    },

    setDiscounts: async (req, res) => {
        try {
            const { exchangeId } = req.params;
            const { discounts } = req.body;
            const shopOwnerEmail = req.user?.email || req.body.shopOwnerEmail;

            if (!discounts || !Array.isArray(discounts)) {
                return res.status(400).send({ message: 'Discounts array is required' });
            }

            const result = await ExchangeService.setDiscounts(exchangeId, shopOwnerEmail, discounts);
            res.send(result);
        } catch (error) {
            res.status(400).send({ message: error.message });
        }
    },

    userAcceptExchange: async (req, res) => {
        try {
            const { exchangeId } = req.params;
            const userEmail = req.user?.email || req.body.userEmail;

            const result = await ExchangeService.userAcceptExchange(exchangeId, userEmail);
            res.send(result);
        } catch (error) {
            res.status(400).send({ message: error.message });
        }
    },

    userRejectExchange: async (req, res) => {
        try {
            const { exchangeId } = req.params;
            const userEmail = req.user?.email || req.body.userEmail;

            const result = await ExchangeService.userRejectExchange(exchangeId, userEmail);
            res.send(result);
        } catch (error) {
            res.status(400).send({ message: error.message });
        }
    },

    confirmExchange: async (req, res) => {
        try {
            const { exchangeId } = req.params;
            const shopOwnerEmail = req.user?.email || req.body.shopOwnerEmail;

            const result = await ExchangeService.confirmExchange(exchangeId, shopOwnerEmail);
            res.send(result);
        } catch (error) {
            res.status(400).send({ message: error.message });
        }
    }
};

module.exports = ExchangeController;

