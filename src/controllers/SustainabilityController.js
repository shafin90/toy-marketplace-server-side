const SustainabilityService = require('../services/SustainabilityService');

const SustainabilityController = {
    getUserStats: async (req, res) => {
        try {
            const { userEmail } = req.user || { userEmail: req.params.userEmail };

            if (!userEmail) {
                return res.status(400).json({ message: 'User email is required' });
            }

            const stats = await SustainabilityService.getUserStats(userEmail);
            const formattedStats = {
                ...stats,
                formattedImpact: SustainabilityService.formatImpact(stats.totalImpact || 0)
            };
            res.json(formattedStats);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    getGlobalStats: async (req, res) => {
        try {
            const stats = await SustainabilityService.getGlobalStats();
            const formattedStats = {
                ...stats,
                formattedImpact: SustainabilityService.formatImpact(stats.totalImpact || 0)
            };
            res.json(formattedStats);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
};

module.exports = SustainabilityController;

