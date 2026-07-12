import { useEffect, useState } from "react";
import { toast } from "react-toastify";

import DashboardLayout from "../layouts/DashboardLayout";
import ResearcherToolbar from "../components/researcher/ResearcherToolbar";
import ResearcherTable from "../components/researcher/ResearcherTable";
import ResearcherManagePanel from "../components/researcher/ResearcherManagePanel";

import { fetchResearchers, updateResearcher } from "../services/researcherService";
import { fetchDepartments } from "../services/departmentService";

function ResearcherPage() {
  const [researchers, setResearchers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [managingResearcher, setManagingResearcher] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [researcherData, departmentData] = await Promise.all([
        fetchResearchers(),
        fetchDepartments(),
      ]);
      setResearchers(researcherData);
      setDepartments(departmentData);
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
        loading={loading}
        onManage={handleManage}
      />
    </DashboardLayout>
  );
}

export default ResearcherPage;