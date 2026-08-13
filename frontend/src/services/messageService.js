import api from "./api";

export const sendMessage = async (receiverId, content) => {
  const response = await api.post("/messages/", {
    receiver_id: receiverId,
    content,
  });
  return response.data;
};

export const fetchConversation = async (otherResearcherId) => {
  const response = await api.get(`/messages/${otherResearcherId}`);
  return response.data;
};