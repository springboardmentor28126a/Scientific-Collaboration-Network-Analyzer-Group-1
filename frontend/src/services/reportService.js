import api from "./api";

export const fetchResearcherReport = async (filters) => {
  const response = await api.get("/reports/researchers", { params: filters });
  return response.data;
};

export const fetchPublicationReport = async (filters) => {
  const response = await api.get("/reports/publications", { params: filters });
  return response.data;
};

export const fetchConferenceReport = async () => {
  const response = await api.get("/reports/conferences");
  return response.data;
};

export const exportPublicationReport = async (filters) => {
  const response = await api.get("/reports/publications/export", {
    params: filters,
    responseType: "blob",
  });

  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", "publication_report.csv");
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};