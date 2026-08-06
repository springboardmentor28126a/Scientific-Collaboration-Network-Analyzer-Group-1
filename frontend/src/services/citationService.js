import api from "./api";

export const getCitations = async () => {
    const response = await api.get("/citations/");
    return response.data;
};

export const getCitationById = async (id) => {
    const response = await api.get(`/citations/${id}`);
    return response.data;
};

export const createCitation = async (citation) => {
    const response = await api.post("/citations/", citation);
    return response.data;
};

export const updateCitation = async (id, citation) => {
    const response = await api.put(`/citations/${id}`, citation);
    return response.data;
};

export const deleteCitation = async (id) => {
    const response = await api.delete(`/citations/${id}`);
    return response.data;
};