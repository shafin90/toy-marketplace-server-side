const ChatService = require('../services/ChatService');

const ChatController = {
    /**
     * Get or create conversation with another user
     */
    getOrCreateConversation: async (req, res) => {
        try {
            const { otherUserEmail } = req.params;
            const userEmail = req.user?.email;

            if (!userEmail) {
                return res.status(401).send({ message: 'Unauthorized' });
            }

            const conversation = await ChatService.getOrCreateConversation(userEmail, otherUserEmail);
            res.send(conversation);
        } catch (error) {
            res.status(400).send({ message: error.message });
        }
    },

    /**
     * Get all conversations for logged in user
     */
    getUserConversations: async (req, res) => {
        try {
            const userEmail = req.user?.email;

            if (!userEmail) {
                return res.status(401).send({ message: 'Unauthorized' });
            }

            const conversations = await ChatService.getUserConversations(userEmail);
            res.send(conversations);
        } catch (error) {
            res.status(500).send({ message: error.message });
        }
    },

    /**
     * Get messages for a conversation
     */
    getConversationMessages: async (req, res) => {
        try {
            const { conversationId } = req.params;
            const userEmail = req.user?.email;
            const limit = parseInt(req.query.limit) || 50;
            const skip = parseInt(req.query.skip) || 0;

            if (!userEmail) {
                return res.status(401).send({ message: 'Unauthorized' });
            }

            const messages = await ChatService.getConversationMessages(conversationId, userEmail, limit, skip);
            res.send(messages);
        } catch (error) {
            res.status(400).send({ message: error.message });
        }
    }
};

module.exports = ChatController;

