const { ObjectId } = require('mongodb');
const { getCollection } = require('../utils/db');

const collectionName = 'shop_follows';

const ShopFollowModel = {
    follow: async (userEmail, shopOwnerEmail) => {
        const follow = {
            userEmail,
            shopOwnerEmail,
            createdAt: new Date()
        };
        // Check if already following
        const existing = await getCollection(collectionName).findOne({
            userEmail,
            shopOwnerEmail
        });
        if (existing) {
            return existing;
        }
        const result = await getCollection(collectionName).insertOne(follow);
        return { ...follow, _id: result.insertedId };
    },

    unfollow: async (userEmail, shopOwnerEmail) => {
        return await getCollection(collectionName).deleteOne({
            userEmail,
            shopOwnerEmail
        });
    },

    isFollowing: async (userEmail, shopOwnerEmail) => {
        const follow = await getCollection(collectionName).findOne({
            userEmail,
            shopOwnerEmail
        });
        return !!follow;
    },

    getUserFollowing: async (userEmail) => {
        return await getCollection(collectionName)
            .find({ userEmail })
            .sort({ createdAt: -1 })
            .toArray();
    },

    getShopFollowers: async (shopOwnerEmail) => {
        return await getCollection(collectionName)
            .find({ shopOwnerEmail })
            .toArray();
    },

    getFollowerCount: async (shopOwnerEmail) => {
        return await getCollection(collectionName).countDocuments({ shopOwnerEmail });
    }
};

module.exports = ShopFollowModel;

