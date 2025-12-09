const { ObjectId } = require('mongodb');
const { getCollection } = require('../utils/db');

const collectionName = 'deliveries';

const DeliveryModel = {
    create: async (delivery) => {
        const newDelivery = {
            ...delivery,
            exchangeId: new ObjectId(delivery.exchangeId),
            status: 'pending', // pending, assigned, in_transit, delivered, cancelled
            createdAt: new Date(),
            updatedAt: new Date()
        };
        const result = await getCollection(collectionName).insertOne(newDelivery);
        return { ...newDelivery, _id: result.insertedId };
    },

    findById: async (id) => {
        return await getCollection(collectionName).findOne({ _id: new ObjectId(id) });
    },

    findByExchange: async (exchangeId) => {
        return await getCollection(collectionName).findOne({
            exchangeId: new ObjectId(exchangeId)
        });
    },

    findByDeliveryMan: async (deliveryManEmail) => {
        return await getCollection(collectionName)
            .find({ deliveryManEmail })
            .sort({ createdAt: -1 })
            .toArray();
    },

    findByUser: async (userEmail) => {
        return await getCollection(collectionName)
            .find({ userEmail })
            .sort({ createdAt: -1 })
            .toArray();
    },

    assignDeliveryMan: async (deliveryId, deliveryManEmail) => {
        return await getCollection(collectionName).updateOne(
            { _id: new ObjectId(deliveryId) },
            {
                $set: {
                    deliveryManEmail,
                    status: 'assigned',
                    assignedAt: new Date(),
                    updatedAt: new Date()
                }
            }
        );
    },

    updateStatus: async (deliveryId, status, updateData = {}) => {
        return await getCollection(collectionName).updateOne(
            { _id: new ObjectId(deliveryId) },
            {
                $set: {
                    status,
                    ...updateData,
                    updatedAt: new Date()
                }
            }
        );
    },

    updateTracking: async (deliveryId, trackingData) => {
        return await getCollection(collectionName).updateOne(
            { _id: new ObjectId(deliveryId) },
            {
                $set: {
                    ...trackingData,
                    updatedAt: new Date()
                }
            }
        );
    }
};

module.exports = DeliveryModel;

