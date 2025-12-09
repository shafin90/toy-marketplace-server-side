const { ObjectId } = require('mongodb');
const { getCollection } = require('../utils/db');

const collectionName = 'messages';

const MessageModel = {
    /**
     * Create a new message
     * @param {Object} messageData - Message data
     * @returns {Promise} Created message
     */
    create: async (messageData) => {
        const newMessage = {
            conversationId: new ObjectId(messageData.conversationId),
            senderEmail: messageData.senderEmail,
            receiverEmail: messageData.receiverEmail,
            text: messageData.text,
            read: false,
            createdAt: new Date()
        };
        const result = await getCollection(collectionName).insertOne(newMessage);
        return { ...newMessage, _id: result.insertedId };
    },

    /**
     * Get messages for a conversation
     * @param {string} conversationId - Conversation ID
     * @param {number} limit - Number of messages to retrieve
     * @param {number} skip - Number of messages to skip
     * @returns {Promise} Array of messages
     */
    getConversationMessages: async (conversationId, limit = 50, skip = 0) => {
        return await getCollection(collectionName)
            .find({ conversationId: new ObjectId(conversationId) })
            .sort({ createdAt: -1 })
            .limit(limit)
            .skip(skip)
            .toArray();
    },

    /**
     * Mark messages as read
     * @param {string} conversationId - Conversation ID
     * @param {string} userEmail - User email (receiver)
     * @returns {Promise} Update result
     */
    markAsRead: async (conversationId, userEmail) => {
        return await getCollection(collectionName).updateMany(
            {
                conversationId: new ObjectId(conversationId),
                receiverEmail: userEmail,
                read: false
            },
            {
                $set: {
                    read: true,
                    readAt: new Date()
                }
            }
        );
    },

    /**
     * Get unread message count for a user
     * @param {string} userEmail - User email
     * @returns {Promise} Unread count
     */
    getUnreadCount: async (userEmail) => {
        return await getCollection(collectionName).countDocuments({
            receiverEmail: userEmail,
            read: false
        });
    },

    /**
     * Get unread messages for a conversation
     * @param {string} conversationId - Conversation ID
     * @param {string} userEmail - User email
     * @returns {Promise} Array of unread messages
     */
    getUnreadMessages: async (conversationId, userEmail) => {
        return await getCollection(collectionName)
            .find({
                conversationId: new ObjectId(conversationId),
                receiverEmail: userEmail,
                read: false
            })
            .toArray();
    }
};

module.exports = MessageModel;

