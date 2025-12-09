const { ObjectId } = require('mongodb');
const { getCollection } = require('../utils/db');

const collectionName = 'collections';

const CollectionModel = {
    create: async (collection) => {
        const newCollection = {
            ...collection,
            toyIds: collection.toyIds.map(id => new ObjectId(id)),
            createdAt: new Date(),
            updatedAt: new Date()
        };
        const result = await getCollection(collectionName).insertOne(newCollection);
        return { ...newCollection, _id: result.insertedId };
    },

    findById: async (id) => {
        return await getCollection(collectionName).findOne({ _id: new ObjectId(id) });
    },

    findByShop: async (shopOwnerEmail) => {
        return await getCollection(collectionName)
            .find({ shopOwnerEmail })
            .sort({ createdAt: -1 })
            .toArray();
    },

    addToy: async (collectionId, toyId) => {
        return await getCollection(collectionName).updateOne(
            { _id: new ObjectId(collectionId) },
            {
                $addToSet: { toyIds: new ObjectId(toyId) },
                $set: { updatedAt: new Date() }
            }
        );
    },

    removeToy: async (collectionId, toyId) => {
        return await getCollection(collectionName).updateOne(
            { _id: new ObjectId(collectionId) },
            {
                $pull: { toyIds: new ObjectId(toyId) },
                $set: { updatedAt: new Date() }
            }
        );
    },

    update: async (id, updateData) => {
        return await getCollection(collectionName).updateOne(
            { _id: new ObjectId(id) },
            {
                $set: {
                    ...updateData,
                    updatedAt: new Date()
                }
            }
        );
    },

    delete: async (id) => {
        return await getCollection(collectionName).deleteOne({ _id: new ObjectId(id) });
    }
};

module.exports = CollectionModel;

