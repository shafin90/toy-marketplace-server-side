const { ObjectId } = require('mongodb');
const { getCollection } = require('../utils/db');

const collectionName = 'shops';

const ShopModel = {
    create: async (shopData) => {
        const newShop = {
            ...shopData,
            createdAt: new Date(),
            updatedAt: new Date()
        };
        const result = await getCollection(collectionName).insertOne(newShop);
        return { ...newShop, _id: result.insertedId };
    },

    findByOwnerEmail: async (shopOwnerEmail) => {
        return await getCollection(collectionName).findOne({ shopOwnerEmail: shopOwnerEmail });
    },

    findAll: async () => {
        return await getCollection(collectionName).find({}).sort({ createdAt: -1 }).toArray();
    },

    findById: async (id) => {
        return await getCollection(collectionName).findOne({ _id: new ObjectId(id) });
    },

    update: async (shopOwnerEmail, updateData) => {
        return await getCollection(collectionName).updateOne(
            { shopOwnerEmail: shopOwnerEmail },
            { $set: { ...updateData, updatedAt: new Date() } }
        );
    },

    addMember: async (shopOwnerEmail, member) => {
        return await getCollection(collectionName).updateOne(
            { shopOwnerEmail: shopOwnerEmail },
            { $push: { members: member } }
        );
    },

    removeMember: async (shopOwnerEmail, memberEmail) => {
        return await getCollection(collectionName).updateOne(
            { shopOwnerEmail: shopOwnerEmail },
            { $pull: { members: { email: memberEmail } } }
        );
    }
};

module.exports = ShopModel;

