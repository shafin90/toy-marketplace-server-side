const OldToyModel = require('../models/OldToyModel');
const { getCollection } = require('../utils/db');

const OldToyService = {
    createOldToy: async (oldToyData) => {
        // Validate required fields
        if (!oldToyData.name || !oldToyData.listedBy) {
            throw new Error('Name and listedBy are required');
        }

        if (!oldToyData.images || oldToyData.images.length === 0) {
            throw new Error('At least one image is required');
        }

        return await OldToyModel.create(oldToyData);
    },

    getOldToyById: async (id) => {
        const oldToy = await OldToyModel.findById(id);
        if (!oldToy) {
            throw new Error('Old toy not found');
        }
        return oldToy;
    },

    getUserOldToys: async (userEmail) => {
        return await OldToyModel.findByUser(userEmail);
    },

    getOldToysByIds: async (ids) => {
        return await OldToyModel.findByIds(ids);
    },

    updateOldToy: async (id, updateData) => {
        const oldToy = await OldToyModel.findById(id);
        if (!oldToy) {
            throw new Error('Old toy not found');
        }
        return await OldToyModel.update(id, updateData);
    },

    deleteOldToy: async (id, userEmail) => {
        const oldToy = await OldToyModel.findById(id);
        if (!oldToy) {
            throw new Error('Old toy not found');
        }
        if (oldToy.listedBy !== userEmail) {
            throw new Error('You can only delete your own old toys');
        }
        return await OldToyModel.delete(id);
    },

    markAsExchanged: async (id) => {
        return await OldToyModel.updateStatus(id, 'exchanged');
    }
};

module.exports = OldToyService;

