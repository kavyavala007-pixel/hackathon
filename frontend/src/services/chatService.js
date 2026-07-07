import api from './api.js';

/** Get conversation history with a user */
export const getMessages = async (userId) => {
  const response = await api.get(`/chat/${userId}`);
  return response.data.data;
};

/** Send a message via REST (fallback; real-time uses Socket.io) */
export const sendMessage = async (receiverId, content) => {
  const response = await api.post('/chat', { receiverId, content });
  return response.data.data;
};
