import { useEffect, useState } from "react";
import { toast } from "react-toastify";

import DashboardLayout from "../layouts/DashboardLayout";
import ResearcherToolbar from "../components/researcher/ResearcherToolbar";
import ResearcherTable from "../components/researcher/ResearcherTable";
import ResearcherManagePanel from "../components/researcher/ResearcherManagePanel";

import { fetchResearchers, updateResearcher } from "../services/researcherService";
import { fetchDepartments } from "../services/departmentService";
import { fetchInstitutions } from "../services/institutionService";

function ResearcherPage() {
  const [researchers, setResearchers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [institutions, setInstitutions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [managingResearcher, setManagingResearcher] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
    
      const [researcherData, departmentData, institutionData] = await Promise.all([
        fetchResearchers(),
        fetchDepartments(),
        fetchInstitutions(),
      ]);
      setResearchers(researcherData);
      setDepartments(departmentData);
      setInstitutions(institutionData);
    } catch (error) {
      console.error(error);
      toast.error("Unable to load researchers.");
    } finally {
      setLoading(false);
    }
  };

  const handleManage = (researcher) => {
    setManagingResearcher(researcher);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSave = async (id, payload) => {
    try {
      await updateResearcher(id, payload);
      toast.success("Researcher updated successfully.");
      setManagingResearcher(null);
      await loadData();
    } catch (error) {
      console.error(error);
      toast.error(error?.response?.data?.detail || "Unable to update researcher.");
    }
  };

  return (
    <DashboardLayout>
      <ResearcherToolbar />

      {managingResearcher && (
        <ResearcherManagePanel
          researcher={managingResearcher}
          departments={departments}
          onSave={handleSave}
          onClose={() => setManagingResearcher(null)}
        />
      )}

      <ResearcherTable
        researchers={researchers}
        departments={departments}
        institutions={institutions}
        loading={loading}
        onManage={handleManage}
      />
    </DashboardLayout>
  );
}

export default ResearcherPage;