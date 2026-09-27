// frontend/src/utils/socket.js
import { io } from 'socket.io-client';

/**
 * Returns the base server URL stripping any trailing /api or /api/v1 paths
 * so Socket.IO connects to the root endpoint (e.g. https://domain.com/socket.io/).
 */
const getSocketUrl = () => {
  const envUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  return envUrl.replace(/\/api(\/v1)?\/?$/, '');
};

let socket = null;

/**
 * Connect and set up the socket for the given user ID.
 * Safe to call multiple times — reuses existing connection.
 */
export const connectSocket = (userId) => {
  const url = getSocketUrl();

  if (!socket) {
    socket = io(url, {
      transports: ['polling', 'websocket'],
      withCredentials: true,
      autoConnect: true,
    });
  }

  if (userId) {
    const setupUser = () => {
      socket.emit('setup', String(userId));
    };

    if (socket.connected) {
      setupUser();
    } else {
      socket.off('connect', setupUser);
      socket.on('connect', setupUser);
    }
  }

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
