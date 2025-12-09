const express = require('express');
const ChatController = require('../controllers/ChatController');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// Get or create conversation with another user
router.get('/chat/conversation/:otherUserEmail', authenticate, ChatController.getOrCreateConversation);

// Get all conversations for logged in user
router.get('/chat/conversations', authenticate, ChatController.getUserConversations);

// Get messages for a conversation
router.get('/chat/conversation/:conversationId/messages', authenticate, ChatController.getConversationMessages);

module.exports = router;

