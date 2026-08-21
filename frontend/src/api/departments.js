import axiosClient from "./axios";


export const getDepartments = () =>
  axiosClient.get("/departments/");


export const getDepartment = (id) =>
  axiosClient.get(`/departments/${id}`);


export const createDepartment = (data) =>
  axiosClient.post("/departments/", data);


export const updateDepartment = (id, data) =>
  axiosClient.put(`/departments/${id}`, data);


export const deleteDepartment = (id) =>
  axiosClient.delete(`/departments/${id}`);


export const getInstitutions = () =>
  axiosClient.get("/institutions/");