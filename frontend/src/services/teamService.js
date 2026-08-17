import api from "./api";

export const getTeams = async () => {
    const response = await api.get("/teams/");
    return response.data;
};

export const createTeam = async (team) => {
    const response = await api.post("/teams/", team);
    return response.data;
};

export const updateTeam = async (id, team) => {
    const response = await api.put(`/teams/${id}`, team);
    return response.data;
};

export const deleteTeam = async (id) => {
    const response = await api.delete(`/teams/${id}`);
    return response.data;
};

export const getTeamById = async (id) => {
    const response = await api.get(`/teams/${id}`);
    return response.data;
};