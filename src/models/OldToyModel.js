const { ObjectId } = require('mongodb');
const { getCollection } = require('../utils/db');

const collectionName = 'old_toys';

const OldToyModel = {
    create: async (oldToyData) => {
        const newOldToy = {
            ...oldToyData,
            status: 'available', // available, pending_exchange, exchanged, sold
            createdAt: new Date(),
            updatedAt: new Date()
        };
        const result = await getCollection(collectionName).insertOne(newOldToy);
        return { ...newOldToy, _id: result.insertedId };
    },

    findById: async (id) => {
        return await getCollection(collectionName).findOne({ _id: new ObjectId(id) });
    },

    findByUser: async (userEmail) => {
        return await getCollection(collectionName).find({ 
            listedBy: userEmail,
            status: 'available' // Only show available old toys
        }).sort({ createdAt: -1 }).toArray();
    },

    findByIds: async (ids) => {
        const objectIds = ids.map(id => new ObjectId(id));
        return await getCollection(collectionName).find({ 
            _id: { $in: objectIds },
            status: 'available'
        }).toArray();
    },

    updateStatus: async (id, status) => {
        return await getCollection(collectionName).updateOne(
            { _id: new ObjectId(id) },
            { $set: { status, updatedAt: new Date() } }
        );
    },

    update: async (id, updateData) => {
        return await getCollection(collectionName).updateOne(
            { _id: new ObjectId(id) },
            { $set: { ...updateData, updatedAt: new Date() } }
        );
    },

    delete: async (id) => {
        return await getCollection(collectionName).deleteOne({ _id: new ObjectId(id) });
    }
};

module.exports = OldToyModel;

