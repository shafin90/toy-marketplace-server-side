const ReviewService = require('../services/ReviewService');

const ReviewController = {
    createReview: async (req, res) => {
        try {
            const result = await ReviewService.createReview(req.body);
            res.send(result);
        } catch (error) {
            res.status(400).send({ message: error.message });
        }
    },

    getReviewsByToy: async (req, res) => {
        try {
            const reviews = await ReviewService.getReviewsByToy(req.params.toyId);
            res.send(reviews);
        } catch (error) {
            res.status(500).send({ message: error.message });
        }
    },

    getReviewsByShopOwner: async (req, res) => {
        try {
            const reviews = await ReviewService.getReviewsByShopOwner(req.params.email);
            res.send(reviews);
        } catch (error) {
            res.status(500).send({ message: error.message });
        }
    },

    updateReview: async (req, res) => {
        try {
            const result = await ReviewService.updateReview(req.params.id, req.body);
            res.send(result);
        } catch (error) {
            res.status(400).send({ message: error.message });
        }
    },

    deleteReview: async (req, res) => {
        try {
            const result = await ReviewService.deleteReview(req.params.id);
            res.send(result);
        } catch (error) {
            res.status(400).send({ message: error.message });
        }
    }
};

module.exports = ReviewController;

