const { Server } = require('socket.io');
const { verifyToken } = require('../utils/jwt');
const ChatService = require('../services/ChatService');
const MessageModel = require('../models/MessageModel');
const ChatModel = require('../models/ChatModel');

// Store active users: { email: socketId }
const activeUsers = new Map();

/**
 * Initialize Socket.io server
 * @param {http.Server} server - HTTP server instance
 * @returns {Server} Socket.io server instance
 */
const initializeSocket = (server) => {
    const io = new Server(server, {
        cors: {
            origin: process.env.CLIENT_URL || "http://localhost:5173",
            methods: ["GET", "POST"],
            credentials: true
        },
        transports: ['websocket', 'polling'], // Allow both but prefer websocket
        pingTimeout: 60000,
        pingInterval: 25000,
        allowEIO3: true
    });

    // Socket authentication middleware
    io.use((socket, next) => {
        const token = socket.handshake.auth.token;
        
        if (!token) {
            return next(new Error('Authentication error: No token provided'));
        }

        try {
            const decoded = verifyToken(token);
            socket.user = decoded;
            next();
        } catch (error) {
            next(new Error('Authentication error: Invalid token'));
        }
    });

    io.on('connection', (socket) => {
        const userEmail = socket.user.email;
        const userName = socket.user.name;

        console.log(`User connected: ${userName} (${userEmail})`);
        
        // Store user's socket ID
        activeUsers.set(userEmail, socket.id);
        
        // Join user's personal room
        socket.join(`user_${userEmail}`);

        // Notify user's contacts that they're online
        socket.broadcast.emit('user-online', {
            email: userEmail,
            name: userName
        });

        /**
         * Handle joining a conversation room
         */
        socket.on('join-conversation', async (conversationId) => {
            try {
                const conversation = await ChatModel.getConversationById(conversationId);
                
                if (conversation && conversation.participants.includes(userEmail)) {
                    socket.join(`conversation_${conversationId}`);
                    socket.emit('joined-conversation', { conversationId });
                } else {
                    socket.emit('error', { message: 'Unauthorized access to conversation' });
                }
            } catch (error) {
                socket.emit('error', { message: error.message });
            }
        });

        /**
         * Handle leaving a conversation room
         */
        socket.on('leave-conversation', (conversationId) => {
            socket.leave(`conversation_${conversationId}`);
        });

        /**
         * Handle sending a message
         */
        socket.on('send-message', async (data) => {
            try {
                const { conversationId, text } = data;

                if (!conversationId || !text || !text.trim()) {
                    socket.emit('error', { message: 'Invalid message data' });
                    return;
                }

                // Debug log to verify sender
                console.log('Sending message:', {
                    conversationId,
                    senderEmail: userEmail,
                    senderName: userName,
                    text: text.trim().substring(0, 50)
                });

                // Send message via service (non-blocking for better performance)
                ChatService.sendMessage(conversationId, userEmail, text.trim())
                    .then(async (message) => {
                        // Get conversation to find receiver
                        const conversation = await ChatModel.getConversationById(conversationId);
                        const receiverEmail = conversation.participants.find(p => p !== userEmail);

                        // Debug log to verify saved message
                        console.log('Message saved:', {
                            messageId: message._id,
                            senderEmail: message.senderEmail,
                            receiverEmail: message.receiverEmail,
                            text: message.text.substring(0, 50)
                        });

                        // Prepare message data
                        const messageData = {
                            ...message,
                            senderName: userName,
                            conversationId: conversationId
                        };

                        // Emit to conversation room immediately
                        io.to(`conversation_${conversationId}`).emit('new-message', messageData);

                        // Also emit to receiver's personal room (if they're not in conversation room)
                        io.to(`user_${receiverEmail}`).emit('new-message-notification', {
                            conversationId,
                            message: messageData
                        });

                        // Emit confirmation to sender
                        socket.emit('message-sent', { messageId: message._id });
                    })
                    .catch((error) => {
                        console.error('Error sending message:', error);
                        socket.emit('error', { message: error.message });
                    });

            } catch (error) {
                console.error('Error sending message:', error);
                socket.emit('error', { message: error.message });
            }
        });

        /**
         * Handle typing indicator
         */
        socket.on('typing', async (data) => {
            try {
                const { conversationId } = data;
                const conversation = await ChatModel.getConversationById(conversationId);
                
                if (conversation && conversation.participants.includes(userEmail)) {
                    socket.to(`conversation_${conversationId}`).emit('user-typing', {
                        conversationId,
                        userEmail,
                        userName,
                        isTyping: true
                    });
                }
            } catch (error) {
                console.error('Error handling typing:', error);
            }
        });

        /**
         * Handle stop typing
         */
        socket.on('stop-typing', async (data) => {
            try {
                const { conversationId } = data;
                const conversation = await ChatModel.getConversationById(conversationId);
                
                if (conversation && conversation.participants.includes(userEmail)) {
                    socket.to(`conversation_${conversationId}`).emit('user-typing', {
                        conversationId,
                        userEmail,
                        userName,
                        isTyping: false
                    });
                }
            } catch (error) {
                console.error('Error handling stop typing:', error);
            }
        });

        /**
         * Handle marking messages as read
         */
        socket.on('mark-read', async (data) => {
            try {
                const { conversationId } = data;
                await MessageModel.markAsRead(conversationId, userEmail);
                
                // Notify other participant
                const conversation = await ChatModel.getConversationById(conversationId);
                const otherParticipant = conversation.participants.find(p => p !== userEmail);
                
                io.to(`user_${otherParticipant}`).emit('messages-read', {
                    conversationId,
                    readBy: userEmail
                });
            } catch (error) {
                console.error('Error marking as read:', error);
            }
        });

        /**
         * Handle disconnect
         */
        socket.on('disconnect', () => {
            console.log(`User disconnected: ${userName} (${userEmail})`);
            activeUsers.delete(userEmail);
            
            // Notify contacts that user is offline
            socket.broadcast.emit('user-offline', {
                email: userEmail,
                name: userName
            });
        });
    });

    return io;
};

/**
 * Get socket ID for a user email
 * @param {string} userEmail - User email
 * @returns {string|null} Socket ID or null
 */
const getUserSocketId = (userEmail) => {
    return activeUsers.get(userEmail) || null;
};

/**
 * Check if user is online
 * @param {string} userEmail - User email
 * @returns {boolean} True if user is online
 */
const isUserOnline = (userEmail) => {
    return activeUsers.has(userEmail);
};

module.exports = {
    initializeSocket,
    getUserSocketId,
    isUserOnline
};

