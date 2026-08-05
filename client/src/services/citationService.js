import api from "./api";

export const createCitation = async (data) => {
  const response = await api.post("/citation/", data);
  return response.data;
};

export const deleteCitation = async (id) => {
  const response = await api.delete(`/citation/${id}`);
  return response.data;
};

export const getCitationStats = async (publicationId) => {
  const response = await api.get(`/citation/stats/${publicationId}`);
  return response.data;
};

export const formatCitation = async (publicationId, style) => {
  const response = await api.get(`/citation/format/${publicationId}`, {
    params: { style },
  });
  return response.data;
};
