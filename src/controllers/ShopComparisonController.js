const ShopComparisonService = require('../services/ShopComparisonService');

const ShopComparisonController = {
    compareShops: async (req, res) => {
        try {
            const { shopOwnerEmails } = req.body;

            if (!shopOwnerEmails || !Array.isArray(shopOwnerEmails) || shopOwnerEmails.length < 2) {
                return res.status(400).json({ 
                    message: 'At least two shop owner emails are required' 
                });
            }

            const comparison = await ShopComparisonService.compareShops(shopOwnerEmails);
            res.json(comparison);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    findBestDeal: async (req, res) => {
        try {
            const { toyName } = req.query;

            if (!toyName) {
                return res.status(400).json({ message: 'Toy name is required' });
            }

            const bestDeal = await ShopComparisonService.findBestDeal(toyName);
            res.json(bestDeal);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
};

module.exports = ShopComparisonController;

