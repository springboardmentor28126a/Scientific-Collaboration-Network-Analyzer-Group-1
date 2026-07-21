import api from "./api";

export const fetchConferences = async () => {
  const response = await api.get("/conferences/");
  return response.data;
};

export const fetchConferenceById = async (id) => {
  const response = await api.get(`/conferences/${id}`);
  return response.data;
};

export const createConference = async (payload) => {
  const response = await api.post("/conferences/", payload);
  return response.data;
};

export const updateConference = async (id, payload) => {
  const response = await api.put(`/conferences/${id}`, payload);
  return response.data;
};

export const deleteConference = async (id) => {
  const response = await api.delete(`/conferences/${id}`);
  return response.data;
};

export const registerForConference = async (conferenceId, payload) => {
  const response = await api.post(`/conferences/${conferenceId}/register`, payload);
  return response.data;
};

export const fetchMyConferenceRegistrations = async () => {
  const response = await api.get("/conferences/my");
  return response.data;
};

export const cancelConferenceRegistration = async (registrationId) => {
  const response = await api.delete(`/conferences/registrations/${registrationId}`);
  return response.data;
};

export const fetchConferenceParticipants = async (conferenceId) => {
  const response = await api.get(`/conferences/${conferenceId}/participants`);
  return response.data;
};