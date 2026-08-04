import axiosClient from "./axios";

export const getResearchers = () => axiosClient.get("/researchers/");
export const getResearcher = (id) => axiosClient.get(`/researchers/${id}`);
export const createResearcher = (data) => axiosClient.post("/researchers/", data);
export const updateResearcher = (id, data) => axiosClient.put(`/researchers/${id}`, data);
export const deleteResearcher = (id) => axiosClient.delete(`/researchers/${id}`);
export const getInstitutions = () => axiosClient.get("/institutions/");
export const getDepartments = () => axiosClient.get("/departments/");
