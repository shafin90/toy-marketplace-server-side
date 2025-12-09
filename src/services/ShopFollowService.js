const ShopFollowModel = require('../models/ShopFollowModel');
const ShopModel = require('../models/ShopModel');
const UserModel = require('../models/UserModel');
const NotificationService = require('./NotificationService');

const ShopFollowService = {
    followShop: async (userEmail, shopOwnerEmail) => {
        // Verify shop owner exists and has shop
        const shopOwner = await UserModel.findByEmail(shopOwnerEmail);
        if (!shopOwner || shopOwner.role !== 'shop_owner') {
            throw new Error('Shop owner not found');
        }
        const shop = await ShopModel.findByOwnerEmail(shopOwnerEmail);
        if (!shop) {
            throw new Error('Shop not found');
        }

        const follow = await ShopFollowModel.follow(userEmail, shopOwnerEmail);

        // Notify shop owner
        await NotificationService.createNotification({
            userEmail: shopOwnerEmail,
            type: 'new_follower',
            title: 'New Follower',
            message: `Someone started following your shop`,
            shopOwnerEmail
        });

        return follow;
    },

    unfollowShop: async (userEmail, shopOwnerEmail) => {
        return await ShopFollowModel.unfollow(userEmail, shopOwnerEmail);
    },

    isFollowing: async (userEmail, shopOwnerEmail) => {
        return await ShopFollowModel.isFollowing(userEmail, shopOwnerEmail);
    },

    getUserFollowing: async (userEmail) => {
        const following = await ShopFollowModel.getUserFollowing(userEmail);
        
        // Populate shop details
        const followingWithShops = await Promise.all(
            following.map(async (follow) => {
                const shop = await ShopModel.findByOwnerEmail(follow.shopOwnerEmail);
                const shopOwner = await UserModel.findByEmail(follow.shopOwnerEmail);
                return {
                    ...follow,
                    shop: shop || null,
                    shopOwner: shopOwner || null
                };
            })
        );

        return followingWithShops.filter(follow => follow.shop !== null);
    },

    getShopFollowers: async (shopOwnerEmail) => {
        return await ShopFollowModel.getShopFollowers(shopOwnerEmail);
    },

    notifyFollowers: async (shopOwnerEmail, notification) => {
        const followers = await ShopFollowModel.getShopFollowers(shopOwnerEmail);
        
        // Notify all followers
        await Promise.all(
            followers.map(follower =>
                NotificationService.createNotification({
                    userEmail: follower.userEmail,
                    ...notification
                })
            )
        );
    }
};

module.exports = ShopFollowService;

