import api from "./api";

export const fetchResearchers = async () => {
  const response = await api.get("/researchers");
  return response.data;
};

export const fetchResearcherById = async (id) => {
  const response = await api.get(`/researchers/${id}`);
  return response.data;
};

export const createResearcher = async (researcher) => {
  const response = await api.post("/researchers", researcher);
  return response.data;
};

export const updateResearcher = async (id, researcher) => {
  const response = await api.put(`/researchers/${id}`, researcher);
  return response.data;
};

export const deleteResearcher = async (id) => {
  const response = await api.delete(`/researchers/${id}`);
  return response.data;
};