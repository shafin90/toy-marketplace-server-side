const { ObjectId } = require('mongodb');
const { getCollection } = require('../utils/db');

const collectionName = 'notifications';

const NotificationModel = {
    create: async (notification) => {
        const newNotification = {
            ...notification,
            read: false,
            createdAt: new Date()
        };
        const result = await getCollection(collectionName).insertOne(newNotification);
        return { ...newNotification, _id: result.insertedId };
    },

    findByUser: async (userEmail) => {
        return await getCollection(collectionName)
            .find({ userEmail })
            .sort({ createdAt: -1 })
            .toArray();
    },

    markAsRead: async (notificationId, userEmail) => {
        return await getCollection(collectionName).updateOne(
            { _id: new ObjectId(notificationId), userEmail },
            { $set: { read: true, readAt: new Date() } }
        );
    },

    markAllAsRead: async (userEmail) => {
        return await getCollection(collectionName).updateMany(
            { userEmail, read: false },
            { $set: { read: true, readAt: new Date() } }
        );
    },

    getUnreadCount: async (userEmail) => {
        return await getCollection(collectionName).countDocuments({
            userEmail,
            read: false
        });
    },

    delete: async (notificationId, userEmail) => {
        return await getCollection(collectionName).deleteOne({
            _id: new ObjectId(notificationId),
            userEmail
        });
    }
};

module.exports = NotificationModel;

