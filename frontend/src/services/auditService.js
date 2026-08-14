import api from "./api";

export const getAuditLogs = async () => {
  const response = await api.get("/audit/");
  return response.data;
};

export const getAuditLogsByModule = async (module) => {
  const response = await api.get(`/audit/module/${module}`);
  return response.data;
};

export const getAuditLogsByUser = async (userId) => {
  const response = await api.get(`/audit/user/${userId}`);
  return response.data;
};

export const createAuditLog = async (data) => {
  const response = await api.post("/audit/", data);
  return response.data;
};