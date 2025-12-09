const PriceAlertService = require('../services/PriceAlertService');

const PriceAlertController = {
    createAlert: async (req, res) => {
        try {
            const { userEmail } = req.user || { userEmail: req.body.userEmail };
            const { toyId, targetPrice } = req.body;

            if (!userEmail || !toyId) {
                return res.status(400).json({ message: 'User email and toy ID are required' });
            }

            const alert = await PriceAlertService.createAlert(userEmail, toyId, targetPrice);
            res.status(201).json(alert);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    },

    getUserAlerts: async (req, res) => {
        try {
            const { userEmail } = req.user || { userEmail: req.params.userEmail };

            if (!userEmail) {
                return res.status(400).json({ message: 'User email is required' });
            }

            const alerts = await PriceAlertService.getUserAlerts(userEmail);
            res.json(alerts);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    deleteAlert: async (req, res) => {
        try {
            const { userEmail } = req.user || { userEmail: req.body.userEmail };
            const { alertId } = req.params;

            if (!userEmail || !alertId) {
                return res.status(400).json({ message: 'User email and alert ID are required' });
            }

            await PriceAlertService.deleteAlert(alertId, userEmail);
            res.json({ message: 'Alert deleted' });
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }
};

module.exports = PriceAlertController;

