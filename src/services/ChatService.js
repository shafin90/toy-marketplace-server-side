const ChatModel = require('../models/ChatModel');
const MessageModel = require('../models/MessageModel');
const UserModel = require('../models/UserModel');

const ChatService = {
    /**
     * Get or create conversation between two users
     * @param {string} user1Email - First user email
     * @param {string} user2Email - Second user email
     * @returns {Promise} Conversation object
     */
    getOrCreateConversation: async (user1Email, user2Email) => {
        if (user1Email === user2Email) {
            throw new Error('Cannot create conversation with yourself');
        }

        // Verify both users exist
        const [user1, user2] = await Promise.all([
            UserModel.findByEmail(user1Email),
            UserModel.findByEmail(user2Email)
        ]);

        if (!user1 || !user2) {
            throw new Error('One or both users not found');
        }

        return await ChatModel.findOrCreateConversation(user1Email, user2Email);
    },

    /**
     * Get all conversations for a user
     * @param {string} userEmail - User email
     * @returns {Promise} Array of conversations with participant details
     */
    getUserConversations: async (userEmail) => {
        const conversations = await ChatModel.getUserConversations(userEmail);
        
        // Populate participant details
        const populatedConversations = await Promise.all(
            conversations.map(async (conv) => {
                const otherParticipantEmail = conv.participants.find(p => p !== userEmail);
                const otherParticipant = await UserModel.findByEmail(otherParticipantEmail);
                
                // Get unread count
                const unreadCount = await MessageModel.getUnreadMessages(conv._id.toString(), userEmail);
                
                return {
                    ...conv,
                    otherParticipant: {
                        email: otherParticipant?.email,
                        name: otherParticipant?.name,
                        photoURL: otherParticipant?.photoURL
                    },
                    unreadCount: unreadCount.length
                };
            })
        );

        return populatedConversations;
    },

    /**
     * Get messages for a conversation
     * @param {string} conversationId - Conversation ID
     * @param {string} userEmail - User email (for marking as read)
     * @param {number} limit - Number of messages
     * @param {number} skip - Skip messages
     * @returns {Promise} Array of messages
     */
    getConversationMessages: async (conversationId, userEmail, limit = 50, skip = 0) => {
        const conversation = await ChatModel.getConversationById(conversationId);
        
        if (!conversation) {
            throw new Error('Conversation not found');
        }

        if (!conversation.participants.includes(userEmail)) {
            throw new Error('Unauthorized access to conversation');
        }

        // Mark messages as read
        await MessageModel.markAsRead(conversationId, userEmail);

        // Get messages
        const messages = await MessageModel.getConversationMessages(conversationId, limit, skip);
        
        // Reverse to show oldest first
        return messages.reverse();
    },

    /**
     * Send a message
     * @param {string} conversationId - Conversation ID
     * @param {string} senderEmail - Sender email
     * @param {string} text - Message text
     * @returns {Promise} Created message
     */
    sendMessage: async (conversationId, senderEmail, text) => {
        const conversation = await ChatModel.getConversationById(conversationId);
        
        if (!conversation) {
            throw new Error('Conversation not found');
        }

        if (!conversation.participants.includes(senderEmail)) {
            throw new Error('Unauthorized: You are not a participant in this conversation');
        }

        const receiverEmail = conversation.participants.find(p => p !== senderEmail);

        // Create message
        const message = await MessageModel.create({
            conversationId,
            senderEmail,
            receiverEmail,
            text
        });

        // Update conversation last message
        await ChatModel.updateLastMessage(conversationId, { text });

        return message;
    }
};

module.exports = ChatService;

