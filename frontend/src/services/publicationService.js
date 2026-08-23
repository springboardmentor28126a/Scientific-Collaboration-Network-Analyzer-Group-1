import api from "./api";

export const createPublication = async (payload) => {
  const response = await api.post("/publications/", payload);
  return response.data;
};

export const fetchMyPublications = async (
  statusFilter = "",
  sort = "newest"
) => {
  const response = await api.get("/publications/mine", {
    params: {
      status_filter: statusFilter || undefined,
      sort,
    },
  });

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

  const response = await api.post(
    `/publications/${id}/upload`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );

  return response.data;
};

export const fetchPublishedPublications = async (
  search = "",
  publicationType = "",
  sort = "newest"
) => {
  const response = await api.get("/publications/published", {
    params: {
      search,
      publication_type: publicationType || undefined,
      sort,
    },
  });

  return response.data;
};

export const downloadPublicationFile = async (id) => {
  const response = await api.get(`/publications/${id}/download`, {
    responseType: "blob",
  });

  let filename = "publication_file";

  const disposition = response.headers["content-disposition"];

  if (disposition) {
    const match = disposition.match(/filename="?([^"]+)"?/);

    if (match && match[1]) {
      filename = match[1];
    }
  }

  const url = window.URL.createObjectURL(
    new Blob([response.data])
  );

  const link = document.createElement("a");

  link.href = url;
  link.setAttribute("download", filename);

  document.body.appendChild(link);
  link.click();
  link.remove();

  window.URL.revokeObjectURL(url);
};

export const archivePublication = async (id) => {
  const response = await api.patch(
    `/publications/${id}/archive`
  );

  return response.data;
};

// AI publication summary
export const generatePublicationSummary = async (id) => {
  const response = await api.post(
    `/publications/${id}/ai-summary`
  );

  return response.data;
};

export const viewPublicationFile = async (id) => {
  const response = await api.get(
    `/publications/${id}/view`,
    {
      responseType: "blob",
    }
  );

  const blob = new Blob(
    [response.data],
    {
      type:
        response.headers["content-type"] ||
        "application/pdf",
    }
  );

  const url = window.URL.createObjectURL(blob);

  window.open(url, "_blank");

  // Give the browser time to open the blob
  setTimeout(() => {
    window.URL.revokeObjectURL(url);
  }, 10000);
};