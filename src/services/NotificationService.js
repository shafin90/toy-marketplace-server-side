const NotificationModel = require('../models/NotificationModel');

const NotificationService = {
    createNotification: async (notification) => {
        return await NotificationModel.create(notification);
    },

    getUserNotifications: async (userEmail, limit = 50) => {
        const notifications = await NotificationModel.findByUser(userEmail);
        return notifications.slice(0, limit);
    },

    markAsRead: async (notificationId, userEmail) => {
        return await NotificationModel.markAsRead(notificationId, userEmail);
    },

    markAllAsRead: async (userEmail) => {
        return await NotificationModel.markAllAsRead(userEmail);
    },

    getUnreadCount: async (userEmail) => {
        return await NotificationModel.getUnreadCount(userEmail);
    },

    deleteNotification: async (notificationId, userEmail) => {
        return await NotificationModel.delete(notificationId, userEmail);
    },

    // Helper methods for different notification types
    notifyPriceDrop: async (userEmail, toy) => {
        return await NotificationModel.create({
            userEmail,
            type: 'price_drop',
            title: 'Price Drop Alert',
            message: `${toy.name} price dropped to ৳${toy.offerPrice || toy.price}`,
            toyId: toy._id.toString()
        });
    },

    notifyNewProduct: async (userEmail, toy, shopName) => {
        return await NotificationModel.create({
            userEmail,
            type: 'new_product',
            title: 'New Product Available',
            message: `${shopName} added ${toy.name}`,
            toyId: toy._id.toString()
        });
    },

    notifyExchangeUpdate: async (userEmail, exchange) => {
        return await NotificationModel.create({
            userEmail,
            type: 'exchange_update',
            title: 'Exchange Request Updated',
            message: `Your exchange request status: ${exchange.status}`,
            exchangeId: exchange._id.toString()
        });
    }
};

module.exports = NotificationService;

