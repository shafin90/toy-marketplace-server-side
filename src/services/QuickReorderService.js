const TransactionModel = require('../models/TransactionModel');
const ToyModel = require('../models/ToyModel');

const QuickReorderService = {
    getUserReorderItems: async (userEmail, limit = 10) => {
        // Get user's purchase history
        const purchases = await TransactionModel.findByType(userEmail, 'purchase');
        
        // Group by toy and get most recent purchase
        const toyMap = new Map();
        purchases.forEach(purchase => {
            const toyId = purchase.toyId?.toString();
            if (toyId) {
                if (!toyMap.has(toyId) || new Date(purchase.createdAt) > new Date(toyMap.get(toyId).createdAt)) {
                    toyMap.set(toyId, purchase);
                }
            }
        });

        // Get toy details for each
        const reorderItems = await Promise.all(
            Array.from(toyMap.values())
                .slice(0, limit)
                .map(async (purchase) => {
                    const toy = await ToyModel.findById(purchase.toyId);
                    if (toy && toy.status === 'available') {
                        return {
                            ...purchase,
                            toy
                        };
                    }
                    return null;
                })
        );

        return reorderItems.filter(item => item !== null);
    },

    canReorder: async (userEmail, toyId) => {
        const purchases = await TransactionModel.findByUser(userEmail);
        return purchases.some(p => p.toyId?.toString() === toyId);
    }
};

module.exports = QuickReorderService;

