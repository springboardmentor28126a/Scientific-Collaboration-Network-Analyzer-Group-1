import axios from "axios";

const API = axios.create({
  baseURL: "http://127.0.0.1:8000",
});

export const createResearcherProfile = (data) =>
  API.post("/researcher-profile/", data);

export const getAllResearcherProfiles = () =>
  API.get("/researcher-profile/");

export const getResearcherProfileById = (id) =>
  API.get(`/researcher-profile/${id}`);

export const updateResearcherProfile = (id, data) =>
  API.put(`/researcher-profile/${id}`, data);

export const deleteResearcherProfile = (id) =>
  API.delete(`/researcher-profile/${id}`);