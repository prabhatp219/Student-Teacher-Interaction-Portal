// frontend/src/utils/socket.js
import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

let socket = null;

/**
 * Connect and set up the socket for the given user ID.
 * Safe to call multiple times — reuses existing connection.
 */
export const connectSocket = (userId) => {
  if (socket && socket.connected) return socket;

  socket = io(SOCKET_URL, {
    transports: ['websocket'],
    withCredentials: true,
  });

  socket.on('connect', () => {
    // Tell the server which user this socket belongs to
    socket.emit('setup', userId);
  });

  return socket;
};

/**
 * Returns the active socket instance, or null if not connected.
 */
export const getSocket = () => socket;

/**
 * Disconnect and tear down the socket.
 */
export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
