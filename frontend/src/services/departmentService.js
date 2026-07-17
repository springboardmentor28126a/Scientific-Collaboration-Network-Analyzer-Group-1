import api from "./api";

export const fetchDepartments = async () => {
  const response = await api.get("/departments");
  return response.data;
};

export const fetchDepartmentById = async (id) => {
  const response = await api.get(`/departments/${id}`);
  return response.data;
};

export const fetchDepartmentsByInstitution = async (institutionId) => {
  const all = await fetchDepartments();
  return all.filter((d) => d.institution_id === Number(institutionId));
};

export const createDepartment = async (payload) => {
  const response = await api.post("/departments", payload);
  return response.data;
};

export const updateDepartment = async (id, payload) => {
  const response = await api.put(`/departments/${id}`, payload);
  return response.data;
};

export const deleteDepartment = async (id) => {
  const response = await api.delete(`/departments/${id}`);
  return response.data;
};