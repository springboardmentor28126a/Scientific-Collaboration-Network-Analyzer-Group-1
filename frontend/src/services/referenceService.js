import api from "./api";

export const getReferences = async () => {
    const response = await api.get("/references/");
    return response.data;
};

export const createReference = async (reference) => {
    const response = await api.post("/references/", reference);
    return response.data;
};

export const updateReference = async (id, reference) => {
    const response = await api.put(`/references/${id}`, reference);
    return response.data;
};

export const deleteReference = async (id) => {
    const response = await api.delete(`/references/${id}`);
    return response.data;
};