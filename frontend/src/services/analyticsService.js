import api from "./api";

export const fetchAnalyticsSummary = async () => {
  const response = await api.get("/analytics/summary");
  return response.data;
};