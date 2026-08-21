import axiosClient from "./axios";

// =========================================================
// PROJECTS
// =========================================================

export const getProjects = () => {
  return axiosClient.get("/projects/");
};

export const getProject = (id) => {
  return axiosClient.get(`/projects/${id}`);
};

export const createProject = (data) => {
  return axiosClient.post("/projects/", data);
};

export const updateProject = (id, data) => {
  return axiosClient.put(`/projects/${id}`, data);
};

export const deleteProject = (id) => {
  return axiosClient.delete(`/projects/${id}`);
};

// =========================================================
// PROJECT MEMBERS
// =========================================================

export const assignProjectMember = (
  projectId,
  memberData
) => {
  return axiosClient.post(
    `/projects/${projectId}/members`,
    memberData
  );
};

export const removeProjectMember = (
  projectId,
  researcherId
) => {
  return axiosClient.delete(
    `/projects/${projectId}/members/${researcherId}`
  );
};