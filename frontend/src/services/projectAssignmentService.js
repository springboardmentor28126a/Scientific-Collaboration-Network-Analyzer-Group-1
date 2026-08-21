import api from "./api";

export const getAssignments = async () => {
    const response = await api.get("/project-assignments/");
    return response.data;
};

export const getAssignmentById = async (id) => {
    const response = await api.get(`/project-assignments/${id}`);
    return response.data;
};

export const createAssignment = async (assignment) => {
    const response = await api.post("/project-assignments/", assignment);
    return response.data;
};

export const updateAssignment = async (id, assignment) => {
    const response = await api.put(`/project-assignments/${id}`, assignment);
    return response.data;
};

export const deleteAssignment = async (id) => {
    const response = await api.delete(`/project-assignments/${id}`);
    return response.data;
};