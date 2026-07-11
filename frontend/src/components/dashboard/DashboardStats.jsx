import StatCard from "./StatCard";

function DashboardStats({
  loading,
  statistics,
}) {

  if (loading) {

    return (
      <div className="app-card p-5 text-center">

        <div
          className="spinner-border text-primary"
          role="status"
        ></div>

        <p className="mt-3 mb-0">

          Loading Dashboard...

        </p>

      </div>
    );

  }

  return (

    <div className="row">

      <StatCard
        title="Researchers"
        value={statistics.researcherCount}
        subtitle="Registered Researchers"
        icon="bi bi-people-fill"
        color="#2563EB"
        link="/researchers"
      />

      <StatCard
        title="Institutions"
        value={statistics.institutionCount}
        subtitle="Registered Institutions"
        icon="bi bi-building"
        color="#22C55E"
        link="/institutions"
      />

      <StatCard
        title="Departments"
        value={statistics.departmentCount}
        subtitle="Academic Departments"
        icon="bi bi-diagram-3-fill"
        color="#F59E0B"
        link="/departments"
      />

      <StatCard
        title="Publications"
        value={statistics.publicationCount}
        subtitle="Research Publications"
        icon="bi bi-journal-richtext"
        color="#8B5CF6"
        link="#"
      />

    </div>

  );

}

export default DashboardStats;