const NotificationService = require('../services/NotificationService');

const NotificationController = {
    getUserNotifications: async (req, res) => {
        try {
            const { userEmail } = req.user || { userEmail: req.params.userEmail };
            const limit = parseInt(req.query.limit) || 50;

            if (!userEmail) {
                return res.status(400).json({ message: 'User email is required' });
            }

            const notifications = await NotificationService.getUserNotifications(userEmail, limit);
            res.json(notifications);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    markAsRead: async (req, res) => {
        try {
            const { userEmail } = req.user || { userEmail: req.body.userEmail };
            const { notificationId } = req.params;

            if (!userEmail || !notificationId) {
                return res.status(400).json({ message: 'User email and notification ID are required' });
            }

            await NotificationService.markAsRead(notificationId, userEmail);
            res.json({ message: 'Notification marked as read' });
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    },

    markAllAsRead: async (req, res) => {
        try {
            const { userEmail } = req.user || { userEmail: req.body.userEmail };

            if (!userEmail) {
                return res.status(400).json({ message: 'User email is required' });
            }

            await NotificationService.markAllAsRead(userEmail);
            res.json({ message: 'All notifications marked as read' });
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    },

    getUnreadCount: async (req, res) => {
        try {
            const { userEmail } = req.user || { userEmail: req.params.userEmail };

            if (!userEmail) {
                return res.status(400).json({ message: 'User email is required' });
            }

            const count = await NotificationService.getUnreadCount(userEmail);
            res.json({ count });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    deleteNotification: async (req, res) => {
        try {
            const { userEmail } = req.user || { userEmail: req.body.userEmail };
            const { notificationId } = req.params;

            if (!userEmail || !notificationId) {
                return res.status(400).json({ message: 'User email and notification ID are required' });
            }

            await NotificationService.deleteNotification(notificationId, userEmail);
            res.json({ message: 'Notification deleted' });
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }
};

module.exports = NotificationController;

