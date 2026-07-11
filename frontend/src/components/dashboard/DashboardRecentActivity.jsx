function DashboardRecentActivity() {

  return (

    <div className="app-card p-4 mt-4">

      <h4 className="fw-bold mb-4">

        Recent Activity

      </h4>

      <div className="text-center py-4">

        <i
          className="bi bi-clock-history"
          style={{
            fontSize: "45px",
            color: "#94a3b8",
          }}
        ></i>

        <p className="text-muted mt-3 mb-0">

          No recent activity available.

        </p>

      </div>

    </div>

  );

}

export default DashboardRecentActivity;