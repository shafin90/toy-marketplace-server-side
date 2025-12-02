const ToyModel = require('../models/ToyModel');
const UserModel = require('../models/UserModel');

const SwapService = {
    executeSwap: async (toyId, buyerEmail, sellerEmail) => {
        // 1. Validate Toy
        const toy = await ToyModel.findById(toyId);
        if (!toy || toy.status !== 'available') {
            throw new Error('Toy not available');
        }

        // 2. Validate Buyer
        const buyer = await UserModel.findByEmail(buyerEmail);
        if (!buyer || buyer.credits < toy.creditCost) {
            throw new Error('Insufficient credits');
        }

        // 3. Execute Swap
        // Deduct from buyer
        await UserModel.updateCredits(buyerEmail, -toy.creditCost, 1);

        // Add to seller
        await UserModel.updateCredits(sellerEmail, toy.creditCost, 1);

        // Update toy status
        await ToyModel.markAsSwapped(toyId, buyerEmail);

        return { success: true, message: 'Swap successful' };
    }
};

module.exports = SwapService;
