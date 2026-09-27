// backend/socket.js
const { Server } = require('socket.io');

let io = null;

const initSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: ['http://localhost:5173', 'https://eduhub-alpha-taupe.vercel.app'],
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  io.on('connection', (socket) => {
    // Join user-specific room
    socket.on('setup', (userId) => {
      if (userId) {
        socket.join(String(userId));
        socket.emit('connected');
      }
    });

    // Join chat room
    socket.on('join_chat', (chatId) => {
      if (chatId) {
        socket.join(String(chatId));
      }
    });

    // Leave chat room
    socket.on('leave_chat', (chatId) => {
      if (chatId) {
        socket.leave(String(chatId));
      }
    });

    // Typing indicators
    socket.on('typing', ({ chatId, userName }) => {
      if (chatId) {
        socket.to(String(chatId)).emit('user_typing', { chatId, userName });
      }
    });

    socket.on('stop_typing', ({ chatId }) => {
      if (chatId) {
        socket.to(String(chatId)).emit('user_stop_typing', { chatId });
      }
    });

    socket.on('disconnect', () => {
      // socket disconnected
    });
  });

  return io;
};

const getIO = () => {
  return io;
};

module.exports = { initSocket, getIO };
