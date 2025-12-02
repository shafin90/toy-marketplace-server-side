const AnalyticsService = require('../services/AnalyticsService');

const AnalyticsController = {
    getShopAnalytics: async (req, res) => {
        try {
            const analytics = await AnalyticsService.getShopAnalytics(req.params.email);
            res.send(analytics);
        } catch (error) {
            res.status(500).send({ message: error.message });
        }
    },

    getSalesTrend: async (req, res) => {
        try {
            const days = parseInt(req.query.days) || 30;
            const trend = await AnalyticsService.getSalesTrend(req.params.email, days);
            res.send(trend);
        } catch (error) {
            res.status(500).send({ message: error.message });
        }
    }
};

module.exports = AnalyticsController;

