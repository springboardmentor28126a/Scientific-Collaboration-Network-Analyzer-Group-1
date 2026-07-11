import { useEffect, useState } from "react";

import DashboardLayout from "../layouts/DashboardLayout";

import DashboardHeader from "../components/dashboard/DashboardHeader";
import DashboardStats from "../components/dashboard/DashboardStats";
import DashboardQuickActions from "../components/dashboard/DashboardQuickActions";
import DashboardRecentActivity from "../components/dashboard/DashboardRecentActivity";

import { fetchDashboardStatistics } from "../services/dashboardService";

function DashboardPage() {

  const [statistics, setStatistics] = useState({
    researcherCount: 0,
    institutionCount: 0,
    departmentCount: 0,
    publicationCount: 0,
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const data = await fetchDashboardStatistics();
      setStatistics(data);
    } catch (error) {
      console.error("Dashboard Error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>

      <DashboardHeader />

      <DashboardStats
        loading={loading}
        statistics={statistics}
      />

      <DashboardQuickActions />

      <DashboardRecentActivity />

    </DashboardLayout>
  );
}

export default DashboardPage;