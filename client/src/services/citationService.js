import axios from "axios";

const API = "http://127.0.0.1:8000/citation";

export const createCitation = async (data) => {
  const response = await axios.post(`${API}/`, data);
  return response.data;
};

export const deleteCitation = async (id) => {
  const response = await axios.delete(`${API}/${id}`);
  return response.data;
};

export const getCitationStats = async (publicationId) => {
  const response = await axios.get(`${API}/stats/${publicationId}`);
  return response.data;
};

export const formatCitation = async (publicationId, style) => {
  const response = await axios.get(`${API}/format/${publicationId}`, {
    params: { style },
  });
  return response.data;
};
