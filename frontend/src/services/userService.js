import api from "./api";

export const getPendingResearchers = async () => {
  const response = await api.get("/users/pending");
  return response.data;
};

export const approveResearcher = async (userId) => {
  const response = await api.patch(`/users/${userId}/approve`);
  return response.data;
};

export const rejectResearcher = async (userId) => {
  const response = await api.patch(`/users/${userId}/reject`);
  return response.data;
};

export const createInstitutionAdmin = async (payload) => {
  const response = await api.post("/users/institution-admin", payload);
  return response.data;
};

export const createReviewer = async (payload) => {
  const response = await api.post("/users/reviewer", payload);
  return response.data;
};

export const fetchAllUsers = async () => {
  const response = await api.get("/users/");
  return response.data;
};