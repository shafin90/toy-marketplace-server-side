# Personal Chat System Documentation

## Overview

A real-time personal chat system implemented using Socket.io, allowing users to send and receive messages instantly. The system supports one-on-one conversations with features like typing indicators, read receipts, and message notifications.

## Features

- ✅ Real-time messaging using Socket.io
- ✅ One-on-one private conversations
- ✅ Typing indicators
- ✅ Message read status
- ✅ Unread message count
- ✅ Conversation list with last message preview
- ✅ Search conversations
- ✅ User authentication for socket connections
- ✅ Message persistence in MongoDB

## Backend Setup

### 1. Install Dependencies

```bash
cd toy-marketplace-server-side
npm install socket.io
```

### 2. Database Collections

The system uses two MongoDB collections:

- **`chats`**: Stores conversation metadata
- **`messages`**: Stores individual messages

These collections are created automatically when the first conversation/message is created.

### 3. Environment Variables

Make sure your `.env` file includes:

```env
PORT=5000
CLIENT_URL=http://localhost:5173  # Your frontend URL
JWT_SECRET=your-secret-key
```

### 4. Start Server

```bash
npm start
```

The Socket.io server will start automatically with the Express server.

## Frontend Setup

### 1. Install Dependencies

```bash
cd toy-marketplace-client-side
npm install socket.io-client
```

### 2. Access Chat

- Navigate to `/chat` route
- Or use the "Chat" link in the navigation bar (only visible when logged in)

## API Endpoints

### REST Endpoints

#### Get or Create Conversation
```
GET /chat/conversation/:otherUserEmail
Authorization: Bearer <token>
```

#### Get All Conversations
```
GET /chat/conversations
Authorization: Bearer <token>
```

#### Get Conversation Messages
```
GET /chat/conversation/:conversationId/messages?limit=50&skip=0
Authorization: Bearer <token>
```

## Socket Events

### Client → Server Events

#### `join-conversation`
Join a conversation room to receive real-time messages.

```javascript
socket.emit('join-conversation', conversationId);
```

#### `leave-conversation`
Leave a conversation room.

```javascript
socket.emit('leave-conversation', conversationId);
```

#### `send-message`
Send a message in a conversation.

```javascript
socket.emit('send-message', {
    conversationId: 'conversation_id',
    text: 'Hello!'
});
```

#### `typing`
Indicate that user is typing.

```javascript
socket.emit('typing', {
    conversationId: 'conversation_id'
});
```

#### `stop-typing`
Stop typing indicator.

```javascript
socket.emit('stop-typing', {
    conversationId: 'conversation_id'
});
```

#### `mark-read`
Mark messages as read.

```javascript
socket.emit('mark-read', {
    conversationId: 'conversation_id'
});
```

### Server → Client Events

#### `new-message`
Receive a new message in real-time.

```javascript
socket.on('new-message', (data) => {
    // data: { _id, conversationId, senderEmail, text, createdAt, senderName }
});
```

#### `new-message-notification`
Receive notification when a new message arrives (even if not in conversation room).

```javascript
socket.on('new-message-notification', (data) => {
    // data: { conversationId, message: {...} }
});
```

#### `user-typing`
Receive typing indicator from other user.

```javascript
socket.on('user-typing', (data) => {
    // data: { conversationId, userEmail, userName, isTyping }
});
```

#### `messages-read`
Notification when messages are marked as read.

```javascript
socket.on('messages-read', (data) => {
    // data: { conversationId, readBy }
});
```

#### `user-online`
Notification when a user comes online.

```javascript
socket.on('user-online', (data) => {
    // data: { email, name }
});
```

#### `user-offline`
Notification when a user goes offline.

```javascript
socket.on('user-offline', (data) => {
    // data: { email, name }
});
```

## Usage Examples

### Starting a Chat from Another Component

```jsx
import StartChatButton from './component/Chat/StartChatButton';

<StartChatButton 
    userEmail="user@example.com" 
    userName="John Doe"
    variant="primary"
    size="sm"
/>
```

### Programmatically Starting a Chat

```javascript
import chatAPI from './api/chatAPI';

const startChat = async (otherUserEmail) => {
    try {
        const conversation = await chatAPI.getOrCreateConversation(otherUserEmail);
        navigate('/chat', { state: { conversationId: conversation._id } });
    } catch (error) {
        console.error('Error starting chat:', error);
    }
};
```

## Data Models

### Conversation Model

```javascript
{
    _id: ObjectId,
    participants: ['user1@email.com', 'user2@email.com'],
    type: 'private',
    lastMessage: 'Last message text',
    lastMessageAt: Date,
    createdAt: Date,
    updatedAt: Date
}
```

### Message Model

```javascript
{
    _id: ObjectId,
    conversationId: ObjectId,
    senderEmail: 'sender@email.com',
    receiverEmail: 'receiver@email.com',
    text: 'Message text',
    read: false,
    createdAt: Date
}
```

## Security

- Socket connections require JWT authentication
- Users can only access conversations they are participants in
- Messages are validated before being stored
- User verification before creating conversations

## Troubleshooting

### Socket Connection Issues

1. Check that `CLIENT_URL` in backend `.env` matches your frontend URL
2. Verify JWT token is valid and included in socket auth
3. Check browser console for connection errors

### Messages Not Appearing

1. Ensure user has joined the conversation room: `socket.emit('join-conversation', conversationId)`
2. Check that both users are participants in the conversation
3. Verify socket event listeners are properly set up

### Typing Indicators Not Working

1. Ensure `typing` and `stop-typing` events are emitted correctly
2. Check that users are in the same conversation room
3. Verify socket connection is active

## Future Enhancements

- [ ] Group chats
- [ ] File/image sharing
- [ ] Message reactions
- [ ] Message editing/deletion
- [ ] Online/offline status indicators
- [ ] Push notifications
- [ ] Message search
- [ ] Chat history pagination

