const SwapService = require('../services/SwapService');

const SwapController = {
    swapToy: async (req, res) => {
        try {
            const { toyId, buyerEmail, sellerEmail } = req.body;
            const result = await SwapService.executeSwap(toyId, buyerEmail, sellerEmail);
            res.send(result);
        } catch (error) {
            res.status(400).send({ message: error.message });
        }
    }
};

module.exports = SwapController;
