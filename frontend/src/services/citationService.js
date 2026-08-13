import api from "./api";

export const addCitation = async (publicationId, payload) => {
  const response = await api.post(`/publications/${publicationId}/citations`, payload);
  return response.data;
};

export const fetchCitations = async (publicationId) => {
  const response = await api.get(`/publications/${publicationId}/citations`);
  return response.data;
};

export const fetchCitationCount = async (publicationId) => {
  const response = await api.get(`/publications/${publicationId}/citations/count`);
  return response.data.count;
};

export const updateCitation = async (citationId, payload) => {
  const response = await api.put(`/publications/citations/${citationId}`, payload);
  return response.data;
};

export const deleteCitation = async (citationId) => {
  const response = await api.delete(`/publications/citations/${citationId}`);
  return response.data;
};