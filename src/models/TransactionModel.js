const { ObjectId } = require('mongodb');
const { getCollection } = require('../utils/db');

const collectionName = 'transactions';

const TransactionModel = {
    create: async (transaction) => {
        const newTransaction = {
            ...transaction,
            createdAt: new Date()
        };
        return await getCollection(collectionName).insertOne(newTransaction);
    },

    findByUser: async (email) => {
        const query = { userId: email };
        return await getCollection(collectionName)
            .find(query)
            .sort({ createdAt: -1 })
            .toArray();
    },

    findByToy: async (toyId) => {
        const query = { toyId: toyId };
        return await getCollection(collectionName).find(query).toArray();
    },

    findByType: async (email, type) => {
        const query = { 
            userId: email,
            type: type 
        };
        return await getCollection(collectionName)
            .find(query)
            .sort({ createdAt: -1 })
            .toArray();
    }
};

module.exports = TransactionModel;

