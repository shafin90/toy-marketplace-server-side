const CollectionService = require('../services/CollectionService');

const CollectionController = {
    createCollection: async (req, res) => {
        try {
            const { shopOwnerEmail } = req.user || { shopOwnerEmail: req.body.shopOwnerEmail };
            const collectionData = req.body;

            if (!shopOwnerEmail) {
                return res.status(400).json({ message: 'Shop owner email is required' });
            }

            const collection = await CollectionService.createCollection(shopOwnerEmail, collectionData);
            res.status(201).json(collection);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    },

    getCollection: async (req, res) => {
        try {
            const { collectionId } = req.params;

            const collection = await CollectionService.getCollection(collectionId);
            res.json(collection);
        } catch (error) {
            res.status(404).json({ message: error.message });
        }
    },

    getShopCollections: async (req, res) => {
        try {
            const { shopOwnerEmail } = req.params;

            if (!shopOwnerEmail) {
                return res.status(400).json({ message: 'Shop owner email is required' });
            }

            const collections = await CollectionService.getShopCollections(shopOwnerEmail);
            res.json(collections);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    addToyToCollection: async (req, res) => {
        try {
            const { collectionId } = req.params;
            const { toyId } = req.body;

            if (!collectionId || !toyId) {
                return res.status(400).json({ message: 'Collection ID and toy ID are required' });
            }

            await CollectionService.addToyToCollection(collectionId, toyId);
            res.json({ message: 'Toy added to collection' });
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    },

    removeToyFromCollection: async (req, res) => {
        try {
            const { collectionId, toyId } = req.params;

            if (!collectionId || !toyId) {
                return res.status(400).json({ message: 'Collection ID and toy ID are required' });
            }

            await CollectionService.removeToyFromCollection(collectionId, toyId);
            res.json({ message: 'Toy removed from collection' });
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    },

    updateCollection: async (req, res) => {
        try {
            const { collectionId } = req.params;
            const updateData = req.body;

            await CollectionService.updateCollection(collectionId, updateData);
            res.json({ message: 'Collection updated' });
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    },

    deleteCollection: async (req, res) => {
        try {
            const { collectionId } = req.params;

            await CollectionService.deleteCollection(collectionId);
            res.json({ message: 'Collection deleted' });
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }
};

module.exports = CollectionController;

