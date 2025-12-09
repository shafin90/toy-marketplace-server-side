const RecentlyViewedService = require('../services/RecentlyViewedService');

const RecentlyViewedController = {
    addView: async (req, res) => {
        try {
            const { userEmail } = req.user || { userEmail: req.body.userEmail };
            const { toyId } = req.body;

            if (!userEmail || !toyId) {
                return res.status(400).json({ message: 'User email and toy ID are required' });
            }

            await RecentlyViewedService.addView(userEmail, toyId);
            res.json({ message: 'View recorded' });
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    },

    getUserRecentlyViewed: async (req, res) => {
        try {
            const { userEmail } = req.user || { userEmail: req.params.userEmail };
            const limit = parseInt(req.query.limit) || 10;

            if (!userEmail) {
                return res.status(400).json({ message: 'User email is required' });
            }

            const recentlyViewed = await RecentlyViewedService.getUserRecentlyViewed(userEmail, limit);
            res.json(recentlyViewed);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    clearHistory: async (req, res) => {
        try {
            const { userEmail } = req.user || { userEmail: req.body.userEmail };

            if (!userEmail) {
                return res.status(400).json({ message: 'User email is required' });
            }

            await RecentlyViewedService.clearHistory(userEmail);
            res.json({ message: 'History cleared' });
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }
};

module.exports = RecentlyViewedController;

