const { getCollection } = require('../utils/db');

const collectionName = 'users';

const UserModel = {
    findByEmail: async (email) => {
        return await getCollection(collectionName).findOne({ email: email });
    },

    create: async (user) => {
        // Set default values for new users
        const newUser = {
            ...user,
            role: user.role || 'user',
            totalEarned: 0,
            totalSpent: 0,
            rating: 0,
            totalRatings: 0,
            createdAt: new Date()
        };
        // Don't store password in the returned user object
        const { password, ...userWithoutPassword } = newUser;
        const result = await getCollection(collectionName).insertOne(newUser);
        return { ...userWithoutPassword, _id: result.insertedId };
    },

    updateProfile: async (email, updateData) => {
        return await getCollection(collectionName).updateOne(
            { email: email },
            { $set: { ...updateData, updatedAt: new Date() } }
        );
    },

    upgradeToShopOwner: async (email, shopData) => {
        return await getCollection(collectionName).updateOne(
            { email: email },
            { 
                $set: { 
                    role: 'shop_owner',
                    shopName: shopData.shopName,
                    shopAddress: shopData.shopAddress,
                    phone: shopData.phone,
                    updatedAt: new Date()
                } 
            }
        );
    },

    /**
     * Update user credits/coins
     * @param {string} email - User email
     * @param {number} amount - Amount to add (positive) or subtract (negative)
     * @param {number} swapCount - Optional swap count increment
     * @returns {Promise} Update result
     */
    updateCredits: async (email, amount, swapCount = 0) => {
        const updateDoc = {
            $inc: {
                credits: amount,
                coins: amount, // Keep both credits and coins in sync
                swapCount: swapCount
            },
            $set: {
                updatedAt: new Date()
            }
        };
        return await getCollection(collectionName).updateOne(
            { email: email },
            updateDoc
        );
    }
};

module.exports = UserModel;
