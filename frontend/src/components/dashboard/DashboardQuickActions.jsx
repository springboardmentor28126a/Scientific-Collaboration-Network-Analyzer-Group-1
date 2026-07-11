import { Link } from "react-router-dom";

function DashboardQuickActions() {

  return (

    <div className="app-card p-4 mt-4">

      <h4 className="fw-bold mb-4">

        Quick Actions

      </h4>

      <div className="row">

        <div className="col-md-4 mb-3">

          <Link
            to="/researchers"
            className="btn btn-primary w-100 py-3"
          >

            <i className="bi bi-person-plus-fill me-2"></i>

            Add Researcher

          </Link>

        </div>

        <div className="col-md-4 mb-3">

          <Link
            to="/institutions"
            className="btn btn-success w-100 py-3"
          >

            <i className="bi bi-building-add me-2"></i>

            Add Institution

          </Link>

        </div>

        <div className="col-md-4 mb-3">

          <Link
            to="/departments"
            className="btn btn-warning w-100 py-3 text-white"
          >

            <i className="bi bi-diagram-3-fill me-2"></i>

            Add Department

          </Link>

        </div>

      </div>

    </div>

  );

}

export default DashboardQuickActions;