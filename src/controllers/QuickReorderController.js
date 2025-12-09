const QuickReorderService = require('../services/QuickReorderService');

const QuickReorderController = {
    getReorderItems: async (req, res) => {
        try {
            const { userEmail } = req.user || { userEmail: req.params.userEmail };
            const limit = parseInt(req.query.limit) || 10;

            if (!userEmail) {
                return res.status(400).json({ message: 'User email is required' });
            }

            const items = await QuickReorderService.getUserReorderItems(userEmail, limit);
            res.json(items);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    canReorder: async (req, res) => {
        try {
            const { userEmail } = req.user || { userEmail: req.query.userEmail };
            const { toyId } = req.query;

            if (!userEmail || !toyId) {
                return res.status(400).json({ message: 'User email and toy ID are required' });
            }

            const canReorder = await QuickReorderService.canReorder(userEmail, toyId);
            res.json({ canReorder });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
};

module.exports = QuickReorderController;

