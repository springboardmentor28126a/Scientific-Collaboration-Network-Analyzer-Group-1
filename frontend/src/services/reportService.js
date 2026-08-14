import api from "./api";

export const getResearchers = async () => {
    const res = await api.get("/researchers/");
    return res.data;
};

export const getPublications = async () => {
    const res = await api.get("/papers/");
    return res.data;
};

export const getProjects = async () => {
    const res = await api.get("/projects/");
    return res.data;
};

export const getTeams = async () => {
    const res = await api.get("/teams/");
    return res.data;
};

export const getInstitutions = async () => {
    const res = await api.get("/institutions/");
    return res.data;
};

export const getCitations = async () => {
    const res = await api.get("/citations/");
    return res.data;
};

export const getReferences = async () => {
    const res = await api.get("/references/");
    return res.data;
};