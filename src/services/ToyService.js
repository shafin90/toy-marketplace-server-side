const ToyModel = require('../models/ToyModel');
const UserModel = require('../models/UserModel');
const EmailService = require('./EmailService');
const TransactionModel = require('../models/TransactionModel');

const ToyService = {
    getAllToys: async (filters = {}) => {
        let toys = await ToyModel.findAllAvailable();
        
        // Apply filters
        if (filters.search) {
            const searchTerm = filters.search.toLowerCase();
            toys = toys.filter(toy => 
                toy.name?.toLowerCase().includes(searchTerm) ||
                toy.description?.toLowerCase().includes(searchTerm) ||
                toy.subcategory?.toLowerCase().includes(searchTerm) ||
                toy.sub_category?.toLowerCase().includes(searchTerm)
            );
        }

        if (filters.category) {
            toys = toys.filter(toy => 
                (toy.subcategory || toy.sub_category) === filters.category
            );
        }

        if (filters.minPrice !== undefined) {
            toys = toys.filter(toy => (toy.price || 0) >= filters.minPrice);
        }

        if (filters.maxPrice !== undefined) {
            toys = toys.filter(toy => (toy.price || 0) <= filters.maxPrice);
        }

        // Sorting
        if (filters.sortBy) {
            switch (filters.sortBy) {
                case 'price_asc':
                    toys.sort((a, b) => (a.price || 0) - (b.price || 0));
                    break;
                case 'price_desc':
                    toys.sort((a, b) => (b.price || 0) - (a.price || 0));
                    break;
                case 'newest':
                    toys.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                    break;
                case 'oldest':
                    toys.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
                    break;
            }
        }

        return toys;
    },

    getToyById: async (id) => {
        return await ToyModel.findById(id);
    },

    // List shop toy (for shop owners)
    addShopToy: async (toyData) => {
        const toy = {
            ...toyData,
            type: 'shop_toy',
            status: 'available',
            listedBy: toyData.listedBy,
            listedByRole: 'shop_owner',
            quantity: parseInt(toyData.quantity) || 1,
            price: parseFloat(toyData.price) || 0,
            offerPrice: toyData.offerPrice ? parseFloat(toyData.offerPrice) : null, // Optional offer price
            allowOldToyExchange: toyData.allowOldToyExchange === true || toyData.allowOldToyExchange === 'true' // NEW: Exchange option
        };
        return await ToyModel.create(toy);
    },

    // List old toy (for regular users to earn coins)
    addOldToy: async (toyData) => {
        const toy = {
            ...toyData,
            type: 'old_toy',
            status: 'pending',
            listedBy: toyData.listedBy,
            listedByRole: 'user',
            requestedCoins: parseInt(toyData.requestedCoins) || 0,
            quantity: 1 // Old toys are typically single items
        };
        return await ToyModel.create(toy);
    },

    // Legacy method for backward compatibility
    addToy: async (toyData) => {
        // Determine type based on data
        if (toyData.type === 'shop_toy' || toyData.listedByRole === 'shop_owner') {
            return await ToyService.addShopToy(toyData);
        } else {
            return await ToyService.addOldToy(toyData);
        }
    },

    updateToy: async (id, toyData) => {
        const updatedData = {
            ...toyData,
            updatedAt: new Date()
        };
        return await ToyModel.update(id, updatedData);
    },

    deleteToy: async (id) => {
        return await ToyModel.delete(id);
    },

    getMyToys: async (email) => {
        if (!email) return [];
        return await ToyModel.findBySeller(email);
    },

    getPendingOldToys: async (shopOwnerEmail) => {
        if (shopOwnerEmail) {
            return await ToyModel.findPendingByShopOwner(shopOwnerEmail);
        }
        return await ToyModel.findPendingOldToys();
    },

    approveOldToy: async (toyId, shopOwnerEmail, coinsAwarded) => {
        // Get toy details
        const toy = await ToyModel.findById(toyId);
        if (!toy || toy.type !== 'old_toy' || toy.status !== 'pending') {
            throw new Error('Invalid toy or already processed');
        }

        // Get shop owner to check coin balance
        const shopOwner = await UserModel.findByEmail(shopOwnerEmail);
        if (!shopOwner) {
            throw new Error('Shop owner not found');
        }

        // Check if shop owner has enough coins
        if (shopOwner.coins < coinsAwarded) {
            throw new Error(`Insufficient coins. You have ${shopOwner.coins} coins but need ${coinsAwarded} coins to purchase this toy.`);
        }

        // Shop owner pays coins to user (circular economy)
        // Deduct coins from shop owner
        await UserModel.updateCredits(shopOwnerEmail, -coinsAwarded);
        
        // Award coins to user
        await UserModel.updateCredits(toy.listedBy, coinsAwarded);

        // Update toy status - mark as approved and transfer ownership to shop owner
        await ToyModel.approveOldToy(toyId, shopOwnerEmail, coinsAwarded);
        
        // Transfer toy ownership to shop owner (they can now list it as shop inventory)
        await ToyModel.update(toyId, {
            listedBy: shopOwnerEmail,
            listedByRole: 'shop_owner',
            type: 'shop_toy', // Convert to shop toy
            status: 'available' // Make it available for sale
        });

        // Create transaction records
        await TransactionModel.create({
            type: 'coin_spent',
            userId: shopOwnerEmail,
            toyId: toyId,
            amount: -coinsAwarded,
            currency: 'coins',
            status: 'completed',
            description: `Purchased old toy "${toy.name}" from ${toy.listedBy}`
        });

        await TransactionModel.create({
            type: 'coin_earned',
            userId: toy.listedBy,
            toyId: toyId,
            amount: coinsAwarded,
            currency: 'coins',
            status: 'completed',
            description: `Sold old toy "${toy.name}" to shop owner for ${coinsAwarded} coins`
        });

        // Send email notification
        try {
            const user = await UserModel.findByEmail(toy.listedBy);
            if (user && user.email) {
                await EmailService.sendOldToyApproved(user.email, toy.name, coinsAwarded);
            }
        } catch (emailError) {
            console.error('Email notification error:', emailError);
            // Don't fail the approval if email fails
        }

        return { 
            success: true, 
            message: `Old toy purchased for ${coinsAwarded} coins. It's now part of your shop inventory.`,
            remainingCoins: shopOwner.coins - coinsAwarded
        };
    },

    rejectOldToy: async (toyId, shopOwnerEmail, rejectionReason) => {
        const toy = await ToyModel.findById(toyId);
        if (!toy || toy.type !== 'old_toy' || toy.status !== 'pending') {
            throw new Error('Invalid toy or already processed');
        }

        await ToyModel.rejectOldToy(toyId, shopOwnerEmail, rejectionReason);

        // Send email notification
        try {
            const user = await UserModel.findByEmail(toy.listedBy);
            if (user && user.email) {
                await EmailService.sendOldToyRejected(user.email, toy.name, rejectionReason);
            }
        } catch (emailError) {
            console.error('Email notification error:', emailError);
            // Don't fail the rejection if email fails
        }

        return { success: true, message: 'Old toy rejected' };
    },

    // Calculate coins for old toy based on condition and category
    calculateCoins: (toy) => {
        const baseValue = 10;
        const conditionMultiplier = {
            'new': 1.0,
            'like_new': 0.8,
            'good': 0.6,
            'fair': 0.4
        };
        
        const categoryValue = {
            'Regular Car': 1.0,
            'Sports Car': 1.5,
            'Truck': 1.2
        };
        
        const condition = toy.condition || 'good';
        const category = toy.subcategory || toy.sub_category || 'Regular Car';
        
        return Math.round(
            baseValue * 
            (conditionMultiplier[condition] || 0.6) * 
            (categoryValue[category] || 1.0)
        );
    }
};

module.exports = ToyService;
