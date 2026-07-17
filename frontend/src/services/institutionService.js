import api from "./api";

export const fetchInstitutions = async () => {
  const response = await api.get("/institutions");
  return response.data;
};

export const fetchInstitutionById = async (id) => {
  const response = await api.get(`/institutions/${id}`);
  return response.data;
};

export const createInstitution = async (payload) => {
  const response = await api.post("/institutions", payload);
  return response.data;
};

export const updateInstitution = async (id, payload) => {
  const response = await api.put(`/institutions/${id}`, payload);
  return response.data;
};

export const deleteInstitution = async (id) => {
  const response = await api.delete(`/institutions/${id}`);
  return response.data;
};