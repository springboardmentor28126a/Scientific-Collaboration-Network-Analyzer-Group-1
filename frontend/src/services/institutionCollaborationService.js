import api from "./api";

export const getCollaborations = async () => {
    const response = await api.get("/institution-collaborations/");
    return response.data;
};

export const getCollaborationById = async (id) => {
    const response = await api.get(`/institution-collaborations/${id}`);
    return response.data;
};

export const createCollaboration = async (collaboration) => {
    const response = await api.post("/institution-collaborations/", collaboration);
    return response.data;
};

export const updateCollaboration = async (id, collaboration) => {
    const response = await api.put(`/institution-collaborations/${id}`, collaboration);
    return response.data;
};

export const deleteCollaboration = async (id) => {
    const response = await api.delete(`/institution-collaborations/${id}`);
    return response.data;
};

export const acceptCollaboration = async (id) => {
    const response = await api.put(
        `/institution-collaborations/${id}/accept`
    );

    return response.data;
};


export const rejectCollaboration = async (id) => {
    const response = await api.put(
        `/institution-collaborations/${id}/reject`
    );

    return response.data;
};

export const getPendingCollaborations = async () => {
    const response = await api.get(
        "/institution-collaborations/pending"
    );

    return response.data;
};