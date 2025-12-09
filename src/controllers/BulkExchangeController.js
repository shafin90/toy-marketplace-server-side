const BulkExchangeService = require('../services/BulkExchangeService');

const BulkExchangeController = {
    createBulkExchange: async (req, res) => {
        try {
            const { userEmail } = req.user || { userEmail: req.body.userEmail };
            const { productId, oldToyIds, shopOwnerEmail } = req.body;

            if (!userEmail || !productId || !oldToyIds || !Array.isArray(oldToyIds) || oldToyIds.length === 0) {
                return res.status(400).json({ 
                    message: 'User email, product ID, shop owner email, and at least one old toy ID are required' 
                });
            }

            const exchange = await BulkExchangeService.createBulkExchange(
                userEmail,
                productId,
                oldToyIds,
                shopOwnerEmail
            );

            res.status(201).json(exchange);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }
};

module.exports = BulkExchangeController;

