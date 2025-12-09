const { ObjectId } = require('mongodb');
const { getCollection } = require('../utils/db');

const collectionName = 'wishlists';

const WishlistModel = {
    addToWishlist: async (userEmail, toyId) => {
        const wishlistItem = {
            userEmail,
            toyId: new ObjectId(toyId),
            createdAt: new Date()
        };
        // Check if already in wishlist
        const existing = await getCollection(collectionName).findOne({
            userEmail,
            toyId: new ObjectId(toyId)
        });
        if (existing) {
            return existing;
        }
        const result = await getCollection(collectionName).insertOne(wishlistItem);
        return { ...wishlistItem, _id: result.insertedId };
    },

    removeFromWishlist: async (userEmail, toyId) => {
        return await getCollection(collectionName).deleteOne({
            userEmail,
            toyId: new ObjectId(toyId)
        });
    },

    getUserWishlist: async (userEmail) => {
        return await getCollection(collectionName)
            .find({ userEmail })
            .sort({ createdAt: -1 })
            .toArray();
    },

    isInWishlist: async (userEmail, toyId) => {
        const item = await getCollection(collectionName).findOne({
            userEmail,
            toyId: new ObjectId(toyId)
        });
        return !!item;
    },

    getWishlistCount: async (userEmail) => {
        return await getCollection(collectionName).countDocuments({ userEmail });
    }
};

module.exports = WishlistModel;

