import { fetchResearchers } from "./researcherService";
import { fetchInstitutions } from "./institutionService";
import { fetchDepartments } from "./departmentService";

export const fetchDashboardStatistics = async () => {
  const [
    researchers,
    institutions,
    departments,
  ] = await Promise.all([
    fetchResearchers(),
    fetchInstitutions(),
    fetchDepartments(),
  ]);

  return {
    researcherCount: researchers.length,
    institutionCount: institutions.length,
    departmentCount: departments.length,
    publicationCount: 0,
  };
};