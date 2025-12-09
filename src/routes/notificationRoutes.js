const express = require('express');
const router = express.Router();
const NotificationController = require('../controllers/NotificationController');

// Notification routes
router.get('/notifications/:userEmail', NotificationController.getUserNotifications);
router.put('/notifications/:notificationId/read', NotificationController.markAsRead);
router.put('/notifications/read-all', NotificationController.markAllAsRead);
router.get('/notifications/:userEmail/unread-count', NotificationController.getUnreadCount);
router.delete('/notifications/:notificationId', NotificationController.deleteNotification);

module.exports = router;

