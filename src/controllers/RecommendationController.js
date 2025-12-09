const RecommendationService = require('../services/RecommendationService');

const RecommendationController = {
    getAgeBasedRecommendations: async (req, res) => {
        try {
            const age = parseInt(req.query.age);

            if (!age || age < 0) {
                return res.status(400).json({ message: 'Valid age is required' });
            }

            const recommendations = await RecommendationService.getAgeBasedRecommendations(age);
            res.json(recommendations);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    getSimilarToys: async (req, res) => {
        try {
            const { toyId } = req.params;

            if (!toyId) {
                return res.status(400).json({ message: 'Toy ID is required' });
            }

            const similarToys = await RecommendationService.getSimilarToys(toyId);
            res.json(similarToys);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    getTrendingToys: async (req, res) => {
        try {
            const trending = await RecommendationService.getTrendingToys();
            res.json(trending);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    getPersonalizedRecommendations: async (req, res) => {
        try {
            const { userEmail } = req.user || { userEmail: req.params.userEmail };

            if (!userEmail) {
                return res.status(400).json({ message: 'User email is required' });
            }

            const recommendations = await RecommendationService.getPersonalizedRecommendations(userEmail);
            res.json(recommendations);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
};

module.exports = RecommendationController;

