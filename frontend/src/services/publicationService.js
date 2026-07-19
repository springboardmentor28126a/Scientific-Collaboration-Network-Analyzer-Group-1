import api from "./api";

export const createPublication = async (payload) => {
  const response = await api.post("/publications/", payload);
  return response.data;
};

export const fetchMyPublications = async () => {
  const response = await api.get("/publications/mine");
  return response.data;
};

export const updatePublication = async (id, payload) => {
  const response = await api.put(`/publications/${id}`, payload);
  return response.data;
};

export const submitPublication = async (id) => {
  const response = await api.patch(`/publications/${id}/submit`);
  return response.data;
};

export const deletePublication = async (id) => {
  const response = await api.delete(`/publications/${id}`);
  return response.data;
};

export const fetchReviewQueue = async () => {
  const response = await api.get("/publications/review-queue");
  return response.data;
};

export const claimPublication = async (id) => {
  const response = await api.patch(`/publications/${id}/claim`);
  return response.data;
};

export const decideReview = async (id, payload) => {
  const response = await api.patch(`/publications/${id}/decide`, payload);
  return response.data;
};

export const uploadPublicationFile = async (id, file) => {
  const formData = new FormData();
  formData.append("file", file);

  const response = await api.post(`/publications/${id}/upload`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};
export const fetchPublishedPublications = async (search = "") => {
  const response = await api.get("/publications/published", { params: { search } });
  return response.data;
};