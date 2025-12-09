const { ObjectId } = require('mongodb');
const { getCollection } = require('../utils/db');

const collectionName = 'recently_viewed';

const RecentlyViewedModel = {
    addView: async (userEmail, toyId) => {
        // Remove existing entry if exists
        await getCollection(collectionName).deleteOne({
            userEmail,
            toyId: new ObjectId(toyId)
        });

        // Add new entry
        const view = {
            userEmail,
            toyId: new ObjectId(toyId),
            viewedAt: new Date()
        };
        const result = await getCollection(collectionName).insertOne(view);
        
        // Keep only last 20 items per user
        const userViews = await getCollection(collectionName)
            .find({ userEmail })
            .sort({ viewedAt: -1 })
            .toArray();
        
        if (userViews.length > 20) {
            const toDelete = userViews.slice(20);
            const idsToDelete = toDelete.map(v => v._id);
            await getCollection(collectionName).deleteMany({
                _id: { $in: idsToDelete }
            });
        }

        return { ...view, _id: result.insertedId };
    },

    getUserRecentlyViewed: async (userEmail, limit = 10) => {
        return await getCollection(collectionName)
            .find({ userEmail })
            .sort({ viewedAt: -1 })
            .limit(limit)
            .toArray();
    },

    clearHistory: async (userEmail) => {
        return await getCollection(collectionName).deleteMany({ userEmail });
    }
};

module.exports = RecentlyViewedModel;

