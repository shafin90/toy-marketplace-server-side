const CollectionModel = require('../models/CollectionModel');
const ToyModel = require('../models/ToyModel');

const CollectionService = {
    createCollection: async (shopOwnerEmail, collectionData) => {
        return await CollectionModel.create({
            shopOwnerEmail,
            name: collectionData.name,
            description: collectionData.description,
            toyIds: collectionData.toyIds || []
        });
    },

    getCollection: async (collectionId) => {
        const collection = await CollectionModel.findById(collectionId);
        if (!collection) {
            throw new Error('Collection not found');
        }

        // Populate toy details
        const toys = await Promise.all(
            collection.toyIds.map(id => ToyModel.findById(id))
        );

        return {
            ...collection,
            toys: toys.filter(toy => toy !== null)
        };
    },

    getShopCollections: async (shopOwnerEmail) => {
        const collections = await CollectionModel.findByShop(shopOwnerEmail);
        
        // Populate toy counts
        const collectionsWithCounts = await Promise.all(
            collections.map(async (collection) => {
                const toys = await Promise.all(
                    collection.toyIds.map(id => ToyModel.findById(id))
                );
                return {
                    ...collection,
                    toyCount: toys.filter(toy => toy !== null).length
                };
            })
        );

        return collectionsWithCounts;
    },

    addToyToCollection: async (collectionId, toyId) => {
        return await CollectionModel.addToy(collectionId, toyId);
    },

    removeToyFromCollection: async (collectionId, toyId) => {
        return await CollectionModel.removeToy(collectionId, toyId);
    },

    updateCollection: async (collectionId, updateData) => {
        return await CollectionModel.update(collectionId, updateData);
    },

    deleteCollection: async (collectionId) => {
        return await CollectionModel.delete(collectionId);
    }
};

module.exports = CollectionService;

