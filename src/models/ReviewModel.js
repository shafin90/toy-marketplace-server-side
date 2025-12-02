const { ObjectId } = require('mongodb');
const { getCollection } = require('../utils/db');

const collectionName = 'reviews';

const ReviewModel = {
    create: async (review) => {
        const newReview = {
            ...review,
            createdAt: new Date(),
            updatedAt: new Date()
        };
        return await getCollection(collectionName).insertOne(newReview);
    },

    findByToy: async (toyId) => {
        const query = { toyId: toyId };
        return await getCollection(collectionName)
            .find(query)
            .sort({ createdAt: -1 })
            .toArray();
    },

    findByShopOwner: async (shopOwnerEmail) => {
        const query = { shopOwnerEmail: shopOwnerEmail };
        return await getCollection(collectionName)
            .find(query)
            .sort({ createdAt: -1 })
            .toArray();
    },

    findByUser: async (userEmail) => {
        const query = { userEmail: userEmail };
        return await getCollection(collectionName)
            .find(query)
            .sort({ createdAt: -1 })
            .toArray();
    },

    calculateAverageRating: async (shopOwnerEmail) => {
        const reviews = await ReviewModel.findByShopOwner(shopOwnerEmail);
        if (reviews.length === 0) return 0;
        
        const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
        return totalRating / reviews.length;
    },

    update: async (id, updateData) => {
        const filter = { _id: new ObjectId(id) };
        const updateDoc = { 
            $set: { 
                ...updateData, 
                updatedAt: new Date() 
            } 
        };
        return await getCollection(collectionName).updateOne(filter, updateDoc);
    },

    findById: async (id) => {
        const query = { _id: new ObjectId(id) };
        return await getCollection(collectionName).findOne(query);
    },

    delete: async (id) => {
        const query = { _id: new ObjectId(id) };
        return await getCollection(collectionName).deleteOne(query);
    }
};

module.exports = ReviewModel;

