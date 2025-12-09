const { ObjectId } = require('mongodb');
const { getCollection } = require('../utils/db');

const collectionName = 'chats';

const ChatModel = {
    /**
     * Create a new chat conversation
     * @param {Object} chatData - Chat data (participants, type)
     * @returns {Promise} Created chat
     */
    createConversation: async (chatData) => {
        const newChat = {
            participants: chatData.participants.sort(), // Sort for consistent lookup
            type: chatData.type || 'private', // private or group
            lastMessage: null,
            lastMessageAt: null,
            createdAt: new Date(),
            updatedAt: new Date()
        };
        const result = await getCollection(collectionName).insertOne(newChat);
        return { ...newChat, _id: result.insertedId };
    },

    /**
     * Find or create conversation between two users
     * @param {string} user1Email - First user email
     * @param {string} user2Email - Second user email
     * @returns {Promise} Chat conversation
     */
    findOrCreateConversation: async (user1Email, user2Email) => {
        const participants = [user1Email, user2Email].sort();
        
        // Try to find existing conversation
        let conversation = await getCollection(collectionName).findOne({
            participants: participants,
            type: 'private'
        });

        // If not found, create new conversation
        if (!conversation) {
            conversation = await ChatModel.createConversation({
                participants: participants,
                type: 'private'
            });
        }

        return conversation;
    },

    /**
     * Get all conversations for a user
     * @param {string} userEmail - User email
     * @returns {Promise} Array of conversations
     */
    getUserConversations: async (userEmail) => {
        return await getCollection(collectionName)
            .find({ participants: userEmail })
            .sort({ lastMessageAt: -1 })
            .toArray();
    },

    /**
     * Get conversation by ID
     * @param {string} conversationId - Conversation ID
     * @returns {Promise} Conversation object
     */
    getConversationById: async (conversationId) => {
        return await getCollection(collectionName).findOne({
            _id: new ObjectId(conversationId)
        });
    },

    /**
     * Update conversation last message
     * @param {string} conversationId - Conversation ID
     * @param {Object} messageData - Last message data
     * @returns {Promise} Update result
     */
    updateLastMessage: async (conversationId, messageData) => {
        return await getCollection(collectionName).updateOne(
            { _id: new ObjectId(conversationId) },
            {
                $set: {
                    lastMessage: messageData.text,
                    lastMessageAt: new Date(),
                    updatedAt: new Date()
                }
            }
        );
    }
};

module.exports = ChatModel;

