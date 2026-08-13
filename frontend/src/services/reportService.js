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

const downloadBlob = (blob, filename) => {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};

export const exportPublicationReportCSV = async (filters) => {
  const response = await api.get("/reports/publications/export", { params: filters, responseType: "blob" });
  downloadBlob(response.data, "publication_report.csv");
};

export const exportPublicationReportExcel = async (filters) => {
  const response = await api.get("/reports/publications/export/excel", { params: filters, responseType: "blob" });
  downloadBlob(response.data, "publication_report.xlsx");
};

export const exportPublicationReportPDF = async (filters) => {
  const response = await api.get("/reports/publications/export/pdf", { params: filters, responseType: "blob" });
  downloadBlob(response.data, "publication_report.pdf");
};