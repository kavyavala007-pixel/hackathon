import Message from '../models/Message.js';

/**
 * Socket.io event handler
 * Manages real-time messaging between patients and doctors
 *
 * Events:
 *  Client → Server:
 *    - join         { userId }           — join personal room
 *    - sendMessage  { receiverId, content, senderId }
 *    - typing       { receiverId }
 *    - stopTyping   { receiverId }
 *
 *  Server → Client:
 *    - receiveMessage  { message }
 *    - typing          { senderId }
 *    - stopTyping      { senderId }
 *    - onlineUsers     [userId, ...]
 */

const onlineUsers = new Map(); // userId -> socketId

export const socketHandler = (io) => {
  io.on('connection', (socket) => {
    console.log(`🔌 Socket connected: ${socket.id}`);

    // User joins their personal room
    socket.on('join', ({ userId }) => {
      if (userId) {
        socket.join(userId);
        onlineUsers.set(userId, socket.id);
        io.emit('onlineUsers', Array.from(onlineUsers.keys()));
        console.log(`👤 User ${userId} joined room`);
      }
    });

    // Handle incoming message
    socket.on('sendMessage', async ({ senderId, receiverId, content }) => {
      try {
        if (!senderId || !receiverId || !content) return;

        // Persist to MongoDB
        const message = await Message.create({ senderId, receiverId, content });

        // Emit to receiver's room
        io.to(receiverId).emit('receiveMessage', {
          _id: message._id,
          senderId,
          receiverId,
          content,
          createdAt: message.createdAt,
          read: false,
        });

        // Confirm back to sender
        socket.emit('messageSent', { _id: message._id, createdAt: message.createdAt });
      } catch (error) {
        socket.emit('error', { 
          message: 'Failed to save message to database', 
          details: error.message 
        });
        console.error('❌ Socket DB Error:', error.message);
      }
    });

    // Typing indicators
    socket.on('typing', ({ receiverId, senderId }) => {
      io.to(receiverId).emit('typing', { senderId });
    });

    socket.on('stopTyping', ({ receiverId, senderId }) => {
      io.to(receiverId).emit('stopTyping', { senderId });
    });

    // Cleanup on disconnect
    socket.on('disconnect', () => {
      for (const [userId, socketId] of onlineUsers.entries()) {
        if (socketId === socket.id) {
          onlineUsers.delete(userId);
          io.emit('onlineUsers', Array.from(onlineUsers.keys()));
          console.log(`👤 User ${userId} disconnected`);
          break;
        }
      }
    });
  });
};
