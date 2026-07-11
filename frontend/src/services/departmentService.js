import api from "./api";

export const fetchDepartments = async () => {
  const response = await api.get("/departments");
  return response.data;
};

export const createDepartment = async (department) => {
  const response = await api.post("/departments", department);
  return response.data;
};

export const fetchDepartment = async (id) => {
    const response = await api.get(`/departments/${id}`);
    return response.data;
};

export const updateDepartment = async (id, department) => {
    const response = await api.put(`/departments/${id}`, department);
    return response.data;
};

export const deleteDepartment = async (id) => {
    const response = await api.delete(`/departments/${id}`);
    return response.data;
};