const ExchangeRequestModel = require('../models/ExchangeRequestModel');
const ToyModel = require('../models/ToyModel');
const OldToyModel = require('../models/OldToyModel');

const BulkExchangeService = {
    createBulkExchange: async (userEmail, productId, oldToyIds, shopOwnerEmail) => {
        // Verify all old toys exist and belong to user
        const oldToys = await OldToyModel.findByIds(oldToyIds);
        
        if (oldToys.length !== oldToyIds.length) {
            throw new Error('Some old toys not found');
        }

        // Verify all belong to user
        const invalidToys = oldToys.filter(toy => toy.listedBy !== userEmail);
        if (invalidToys.length > 0) {
            throw new Error('Some toys do not belong to you');
        }

        // Verify product exists
        const product = await ToyModel.findById(productId);
        if (!product || product.type !== 'shop_toy') {
            throw new Error('Product not found or not available for exchange');
        }

        // Create bulk exchange request
        const exchangeData = {
            userId: userEmail,
            productId: productId,
            shopOwnerEmail: shopOwnerEmail,
            oldToys: oldToys.map(toy => ({
                oldToyId: toy._id.toString(),
                name: toy.name,
                condition: toy.condition,
                discountAmount: 0 // Will be set by shop owner
            })),
            originalPrice: product.offerPrice || product.price,
            totalDiscount: 0,
            finalPrice: product.offerPrice || product.price,
            status: 'pending_shop_owner',
            isBulk: true,
            bulkCount: oldToys.length
        };

        return await ExchangeRequestModel.create(exchangeData);
    },

    calculateBulkDiscount: (oldToys, baseDiscounts) => {
        // Base discount from individual toys
        let totalDiscount = 0;
        oldToys.forEach(oldToy => {
            const discount = baseDiscounts[oldToy.oldToyId] || 0;
            totalDiscount += discount;
        });

        // Bulk bonus: 10% extra discount for 3+ toys
        if (oldToys.length >= 3) {
            totalDiscount *= 1.1;
        }

        // Bulk bonus: 20% extra discount for 5+ toys
        if (oldToys.length >= 5) {
            totalDiscount *= 1.2;
        }

        return Math.round(totalDiscount);
    }
};

module.exports = BulkExchangeService;

