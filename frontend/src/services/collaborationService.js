import api from "./api";

export const sendCollaborationRequest = async (payload) => {
  const response = await api.post("/collaborations/", payload);
  return response.data;
};

export const fetchIncomingRequests = async () => {
  const response = await api.get("/collaborations/incoming");
  return response.data;
};

export const fetchSentRequests = async () => {
  const response = await api.get("/collaborations/sent");
  return response.data;
};

export const fetchMyCollaborators = async () => {
  const response = await api.get("/collaborations/mine");
  return response.data;
};

export const respondToRequest = async (id, accept) => {
  const response = await api.patch(`/collaborations/${id}/respond`, { accept });
  return response.data;
};

export const fetchMyResearcherId = async () => {
  const response = await api.get("/collaborations/my-researcher-id");
  return response.data.researcher_id;
};