const ToyService = require('../services/ToyService');
const path = require('path');

const ToyController = {
    getAllToys: async (req, res) => {
        try {
            const filters = {
                search: req.query.search,
                category: req.query.category,
                minPrice: req.query.minPrice ? parseFloat(req.query.minPrice) : undefined,
                maxPrice: req.query.maxPrice ? parseFloat(req.query.maxPrice) : undefined,
                minCoins: req.query.minCoins ? parseInt(req.query.minCoins) : undefined,
                maxCoins: req.query.maxCoins ? parseInt(req.query.maxCoins) : undefined,
                sortBy: req.query.sortBy
            };
            const toys = await ToyService.getAllToys(filters);
            res.send(toys);
        } catch (error) {
            res.status(500).send({ message: error.message });
        }
    },

    getToyById: async (req, res) => {
        try {
            const toy = await ToyService.getToyById(req.params.id);
            res.send(toy);
        } catch (error) {
            res.status(500).send({ message: error.message });
        }
    },

    addToy: async (req, res) => {
        try {
            // Handle file upload
            const toyData = { ...req.body };
            if (req.file) {
                toyData.picture = `/uploads/${req.file.filename}`;
                toyData.pictureUrl = `/uploads/${req.file.filename}`;
            }
            
            const result = await ToyService.addToy(toyData);
            res.send(result);
        } catch (error) {
            res.status(500).send({ message: error.message });
        }
    },

    addShopToy: async (req, res) => {
        try {
            const toyData = { ...req.body };
            if (req.file) {
                toyData.picture = `/uploads/${req.file.filename}`;
                toyData.pictureUrl = `/uploads/${req.file.filename}`;
            }
            
            const result = await ToyService.addShopToy(toyData);
            res.send(result);
        } catch (error) {
            res.status(500).send({ message: error.message });
        }
    },

    addOldToy: async (req, res) => {
        try {
            const toyData = { ...req.body };
            if (req.file) {
                toyData.picture = `/uploads/${req.file.filename}`;
                toyData.pictureUrl = `/uploads/${req.file.filename}`;
            }
            
            const result = await ToyService.addOldToy(toyData);
            res.send(result);
        } catch (error) {
            res.status(500).send({ message: error.message });
        }
    },

    updateToy: async (req, res) => {
        try {
            const updatedData = { ...req.body };
            if (req.file) {
                updatedData.picture = `/uploads/${req.file.filename}`;
                updatedData.pictureUrl = `/uploads/${req.file.filename}`;
            }
            
            const result = await ToyService.updateToy(req.params.id, updatedData);
            res.send(result);
        } catch (error) {
            res.status(500).send({ message: error.message });
        }
    },

    deleteToy: async (req, res) => {
        try {
            const result = await ToyService.deleteToy(req.params.id);
            res.send(result);
        } catch (error) {
            res.status(500).send({ message: error.message });
        }
    },

    getMyToys: async (req, res) => {
        try {
            const toys = await ToyService.getMyToys(req.query.email);
            res.send(toys);
        } catch (error) {
            res.status(500).send({ message: error.message });
        }
    },

    getPendingOldToys: async (req, res) => {
        try {
            const toys = await ToyService.getPendingOldToys(req.query.shopOwnerEmail);
            res.send(toys);
        } catch (error) {
            res.status(500).send({ message: error.message });
        }
    },

    approveOldToy: async (req, res) => {
        try {
            const { toyId, shopOwnerEmail } = req.params;
            const { coinsAwarded } = req.body;
            
            // If coins not provided, calculate them
            let coins = coinsAwarded;
            if (!coins) {
                const toy = await ToyService.getToyById(toyId);
                coins = ToyService.calculateCoins(toy);
            }
            
            const result = await ToyService.approveOldToy(toyId, shopOwnerEmail, coins);
            res.send(result);
        } catch (error) {
            res.status(400).send({ message: error.message });
        }
    },

    rejectOldToy: async (req, res) => {
        try {
            const { toyId, shopOwnerEmail } = req.params;
            const { rejectionReason } = req.body;
            
            const result = await ToyService.rejectOldToy(toyId, shopOwnerEmail, rejectionReason || 'Not specified');
            res.send(result);
        } catch (error) {
            res.status(400).send({ message: error.message });
        }
    }
};

module.exports = ToyController;
