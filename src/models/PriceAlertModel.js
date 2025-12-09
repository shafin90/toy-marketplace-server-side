const { ObjectId } = require('mongodb');
const { getCollection } = require('../utils/db');

const collectionName = 'price_alerts';

const PriceAlertModel = {
    create: async (alert) => {
        const newAlert = {
            ...alert,
            toyId: new ObjectId(alert.toyId),
            notified: false,
            createdAt: new Date()
        };
        // Check if alert already exists
        const existing = await getCollection(collectionName).findOne({
            userEmail: alert.userEmail,
            toyId: new ObjectId(alert.toyId)
        });
        if (existing) {
            return existing;
        }
        const result = await getCollection(collectionName).insertOne(newAlert);
        return { ...newAlert, _id: result.insertedId };
    },

    findByUser: async (userEmail) => {
        return await getCollection(collectionName)
            .find({ userEmail })
            .sort({ createdAt: -1 })
            .toArray();
    },

    findByToy: async (toyId) => {
        return await getCollection(collectionName)
            .find({ toyId: new ObjectId(toyId), notified: false })
            .toArray();
    },

    markAsNotified: async (alertId) => {
        return await getCollection(collectionName).updateOne(
            { _id: new ObjectId(alertId) },
            { $set: { notified: true, notifiedAt: new Date() } }
        );
    },

    delete: async (alertId, userEmail) => {
        return await getCollection(collectionName).deleteOne({
            _id: new ObjectId(alertId),
            userEmail
        });
    }
};

module.exports = PriceAlertModel;

