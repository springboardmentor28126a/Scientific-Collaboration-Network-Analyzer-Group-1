import axiosClient from "./axios";


// =========================================================
// REPORT DATA
// =========================================================

export const getPublicationReport = () =>
  axiosClient.get("/reports/publications");


export const getResearcherReport = () =>
  axiosClient.get("/reports/researchers");


export const getCollaborationReport = () =>
  axiosClient.get("/reports/collaborations");


export const getInstitutionReport = () =>
  axiosClient.get("/reports/institutions");


// =========================================================
// SAVED REPORTS
// =========================================================

export const getSavedReports = () =>
  axiosClient.get("/reports/saved");


export const createSavedReport = (data) =>
  axiosClient.post("/reports/saved", data);


export const updateSavedReport = (id, data) =>
  axiosClient.put(
    `/reports/saved/${id}`,
    data
  );


export const deleteSavedReport = (id) =>
  axiosClient.delete(
    `/reports/saved/${id}`
  );


// =========================================================
// CSV EXPORT
// =========================================================

export const exportCsvReport = (reportType) =>
  axiosClient.get(
    "/reports/export/csv",
    {
      params: {
        report_type: reportType,
      },

      responseType: "blob",
    }
  );


// =========================================================
// PDF EXPORT
// =========================================================

export const exportPdfReport = (reportType) =>
  axiosClient.get(
    "/reports/export/pdf",
    {
      params: {
        report_type: reportType,
      },

      responseType: "blob",
    }
  );