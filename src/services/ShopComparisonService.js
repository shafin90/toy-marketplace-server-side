const ShopModel = require('../models/ShopModel');
const ToyModel = require('../models/ToyModel');
const ReviewModel = require('../models/ReviewModel');

const ShopComparisonService = {
    compareShops: async (shopOwnerEmails) => {
        const shops = await Promise.all(
            shopOwnerEmails.map(email => ShopModel.findByOwnerEmail(email))
        );

        const shopsWithStats = await Promise.all(
            shops.map(async (shop) => {
                if (!shop) return null;

                // Get shop toys
                const toys = await ToyModel.findBySeller(shop.ownerEmail);
                const availableToys = toys.filter(t => t.status === 'available');

                // Calculate average price
                const prices = availableToys
                    .map(t => t.offerPrice || t.price || 0)
                    .filter(p => p > 0);
                const avgPrice = prices.length > 0
                    ? prices.reduce((a, b) => a + b, 0) / prices.length
                    : 0;

                // Get shop rating
                const reviews = await ReviewModel.findByShopOwner(shop.ownerEmail);
                const avgRating = reviews.length > 0
                    ? reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviews.length
                    : 0;

                return {
                    shop,
                    stats: {
                        totalProducts: availableToys.length,
                        averagePrice: Math.round(avgPrice),
                        averageRating: avgRating.toFixed(1),
                        totalReviews: reviews.length,
                        minPrice: prices.length > 0 ? Math.min(...prices) : 0,
                        maxPrice: prices.length > 0 ? Math.max(...prices) : 0
                    }
                };
            })
        );

        return shopsWithStats.filter(s => s !== null);
    },

    findBestDeal: async (toyName) => {
        // Find all shops selling this toy
        const toys = await ToyModel.findAllAvailable();
        const matchingToys = toys.filter(t => 
            t.name?.toLowerCase().includes(toyName.toLowerCase())
        );

        if (matchingToys.length === 0) return null;

        // Group by shop
        const shopMap = new Map();
        matchingToys.forEach(toy => {
            const shopEmail = toy.listedBy;
            if (!shopMap.has(shopEmail)) {
                shopMap.set(shopEmail, []);
            }
            shopMap.get(shopEmail).push(toy);
        });

        // Find best price
        let bestDeal = null;
        let bestPrice = Infinity;

        for (const [shopEmail, shopToys] of shopMap.entries()) {
            shopToys.forEach(toy => {
                const price = toy.offerPrice || toy.price || 0;
                if (price > 0 && price < bestPrice) {
                    bestPrice = price;
                    bestDeal = {
                        shopEmail,
                        toy,
                        price
                    };
                }
            });
        }

        return bestDeal;
    }
};

module.exports = ShopComparisonService;

