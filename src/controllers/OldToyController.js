const OldToyService = require('../services/OldToyService');

const OldToyController = {
    createOldToy: async (req, res) => {
        try {
            if (!req.files || req.files.length === 0) {
                return res.status(400).send({ message: 'At least one image is required' });
            }

            // Handle multiple images (up to 4)
            const images = req.files.map(file => `/uploads/${file.filename}`);

            const oldToyData = {
                name: req.body.name,
                details: req.body.details || req.body.detail_description,
                images: images,
                purchaseDate: req.body.purchaseDate ? new Date(req.body.purchaseDate) : new Date(),
                purchaseLocation: req.body.purchaseLocation,
                listedBy: req.body.listedBy || req.user?.email
            };

            const result = await OldToyService.createOldToy(oldToyData);
            res.send(result);
        } catch (error) {
            res.status(400).send({ message: error.message });
        }
    },

    getOldToyById: async (req, res) => {
        try {
            const { id } = req.params;
            const oldToy = await OldToyService.getOldToyById(id);
            res.send(oldToy);
        } catch (error) {
            res.status(404).send({ message: error.message });
        }
    },

    getUserOldToys: async (req, res) => {
        try {
            const { email } = req.query;
            const oldToys = await OldToyService.getUserOldToys(email);
            res.send(oldToys);
        } catch (error) {
            res.status(400).send({ message: error.message });
        }
    },

    updateOldToy: async (req, res) => {
        try {
            const { id } = req.params;
            const result = await OldToyService.updateOldToy(id, req.body);
            res.send(result);
        } catch (error) {
            res.status(400).send({ message: error.message });
        }
    },

    deleteOldToy: async (req, res) => {
        try {
            const { id } = req.params;
            const userEmail = req.user?.email || req.body.userEmail;
            await OldToyService.deleteOldToy(id, userEmail);
            res.send({ success: true, message: 'Old toy deleted successfully' });
        } catch (error) {
            res.status(400).send({ message: error.message });
        }
    }
};

module.exports = OldToyController;

