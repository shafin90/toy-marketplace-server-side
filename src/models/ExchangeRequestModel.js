const { ObjectId } = require('mongodb');
const { getCollection } = require('../utils/db');

const collectionName = 'exchange_requests';

const ExchangeRequestModel = {
    create: async (exchangeData) => {
        const newExchange = {
            ...exchangeData,
            status: 'pending_shop_owner', // pending_shop_owner, price_set, user_accepted, user_rejected, confirmed, delivered
            createdAt: new Date(),
            updatedAt: new Date()
        };
        const result = await getCollection(collectionName).insertOne(newExchange);
        return { ...newExchange, _id: result.insertedId };
    },

    findById: async (id) => {
        return await getCollection(collectionName).findOne({ _id: new ObjectId(id) });
    },

    findByShopOwner: async (shopOwnerEmail) => {
        return await getCollection(collectionName).find({ 
            shopOwnerEmail: shopOwnerEmail 
        }).sort({ createdAt: -1 }).toArray();
    },

    findByUser: async (userEmail) => {
        return await getCollection(collectionName).find({ 
            userId: userEmail 
        }).sort({ createdAt: -1 }).toArray();
    },

    findByProduct: async (productId) => {
        return await getCollection(collectionName).find({ 
            productId: new ObjectId(productId) 
        }).toArray();
    },

    update: async (id, updateData) => {
        return await getCollection(collectionName).updateOne(
            { _id: new ObjectId(id) },
            { $set: { ...updateData, updatedAt: new Date() } }
        );
    },

    updateStatus: async (id, status) => {
        return await getCollection(collectionName).updateOne(
            { _id: new ObjectId(id) },
            { $set: { status, updatedAt: new Date() } }
        );
    },

    delete: async (id) => {
        return await getCollection(collectionName).deleteOne({ _id: new ObjectId(id) });
    }
};

module.exports = ExchangeRequestModel;

