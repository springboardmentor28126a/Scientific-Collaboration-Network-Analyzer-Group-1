import api from "./api";

export const fetchInstitutions = async () => {
  const response = await api.get("/institutions");
  return response.data;
};

export const createInstitution = async (institution) => {
  const response = await api.post("/institutions", institution);
  return response.data;
};

export const fetchInstitution = async (id) => {
    const response = await api.get(`/institutions/${id}`);
    return response.data;
};

export const updateInstitution = async (id, institution) => {
    const response = await api.put(`/institutions/${id}`, institution);
    return response.data;
};

export const deleteInstitution = async (id) => {
    const response = await api.delete(`/institutions/${id}`);
    return response.data;
};