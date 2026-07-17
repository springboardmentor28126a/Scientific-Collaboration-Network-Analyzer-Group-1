import { Link } from "react-router-dom";

function StatCard({
  title,
  value,
  subtitle,
  icon,
  color,
  link,
}) {
  return (
    <div className="col-xl-3 col-md-6 mb-4">

      <div className="app-card h-100 p-4">

        <div className="d-flex justify-content-between align-items-start">

          <div>

            <p className="text-muted mb-1 fw-semibold">
              {title}
            </p>

            <h2 className="fw-bold mb-1">
              {value}
            </h2>

            <small className="text-secondary">
              {subtitle}
            </small>

          </div>

          <div
            className="rounded-circle d-flex align-items-center justify-content-center"
            style={{
              width: "60px",
              height: "60px",
              backgroundColor: color,
              color: "#fff",
              fontSize: "24px",
            }}
          >
            <i className={icon}></i>
          </div>

        </div>

        <hr />

        <Link
          to={link}
          className="text-decoration-none fw-semibold"
        >
          View Details →
        </Link>

      </div>

    </div>
  );
}

export default StatCard;