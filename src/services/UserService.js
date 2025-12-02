const UserModel = require('../models/UserModel');

const UserService = {
    registerUser: async (userData) => {
        const existingUser = await UserModel.findByEmail(userData.email);
        if (existingUser) {
            // Return existing user instead of throwing error
            return existingUser;
        }

        return await UserModel.create(userData);
    },

    getUserByEmail: async (email) => {
        return await UserModel.findByEmail(email);
    },

    updateProfile: async (email, profileData) => {
        return await UserModel.updateProfile(email, profileData);
    },

    upgradeToShopOwner: async (email, shopData) => {
        const user = await UserModel.findByEmail(email);
        if (!user) {
            throw new Error('User not found');
        }
        if (user.role === 'shop_owner') {
            throw new Error('User is already a shop owner');
        }
        return await UserModel.upgradeToShopOwner(email, shopData);
    }
};

module.exports = UserService;
