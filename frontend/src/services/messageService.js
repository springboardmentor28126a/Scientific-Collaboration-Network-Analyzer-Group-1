import api from "./api";

export const sendChatMessage = async (collaborationId, content) => {
  const response = await api.post(`/collaborations/${collaborationId}/messages`, { content });
  return response.data;
};

export const fetchChatMessages = async (collaborationId) => {
  const response = await api.get(`/collaborations/${collaborationId}/messages`);
  return response.data;
};