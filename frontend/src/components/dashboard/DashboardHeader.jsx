import { useAuth } from "../../hooks/useAuth";

function DashboardHeader() {
  const { auth } = useAuth();

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="app-card p-4 mb-4">

      <div className="d-flex justify-content-between align-items-center">

        <div>

          <h2 className="fw-bold mb-2">
            Dashboard
          </h2>

          <p className="text-muted mb-0">

            Welcome back,

            <span className="fw-semibold text-primary">
              {" "}
              {auth?.username || "User"}
            </span>

            👋

          </p>

        </div>

        <div className="text-end">

          <small className="text-secondary">

            {today}

          </small>

        </div>

      </div>

    </div>
  );
}

export default DashboardHeader;