import axiosClient from "./axios";

export const getCollaborations = () => axiosClient.get("/collaborations/");
export const getCollaboration = (id) => axiosClient.get(`/collaborations/${id}`);
export const createCollaboration = (data) => axiosClient.post("/collaborations/", data);
export const updateCollaboration = (id, data) => axiosClient.put(`/collaborations/${id}`, data);
export const deleteCollaboration = (id) => axiosClient.delete(`/collaborations/${id}`);
