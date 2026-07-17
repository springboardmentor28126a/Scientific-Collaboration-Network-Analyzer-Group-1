import { NavLink } from "react-router-dom";

const menuItems = [
  {
    name: "Dashboard",
    icon: "bi-speedometer2",
    path: "/",
    completed: true,
  },
  {
    name: "Researchers",
    icon: "bi-person-workspace",
    path: "/researchers",
    completed: true,
  },
  {
    name: "Institutions",
    icon: "bi-building",
    path: "/institutions",
    completed: true,
  },
  {
    name: "Departments",
    icon: "bi-diagram-3",
    path: "/departments",
    completed: true,
  },
  {
    name: "Users",
    icon: "bi-people",
    path: "/users",
    completed: false,
  },
  {
    name: "Publications",
    icon: "bi-journal-text",
    path: "#",
    completed: false,
  },
  {
    name: "Collaborations",
    icon: "bi-share",
    path: "#",
    completed: false,
  },
  {
    name: "Conferences",
    icon: "bi-mic",
    path: "#",
    completed: false,
  },
  {
    name: "Reports",
    icon: "bi-bar-chart",
    path: "#",
    completed: false,
  },
];

function Sidebar() {
  return (
    <div
      className="d-flex flex-column p-3 shadow"
      style={{
        width: "260px",
        minHeight: "calc(100vh - 70px)",
        background: "#1E293B",
      }}
    >
      <h5 className="text-white mb-4">
        Navigation
      </h5>

      {menuItems.map((item) => (
        <NavLink
          key={item.name}
          to={item.path}
          className="text-decoration-none mb-2"
        >
          <div
            className="d-flex justify-content-between align-items-center px-3 py-2 rounded"
            style={{
              color: "white",
              transition: "0.3s",
            }}
          >
            <span>
              <i className={`bi ${item.icon} me-2`}></i>

              {item.name}
            </span>

            {item.completed ? (
              <i
                className="bi bi-check-circle-fill"
                style={{
                  color: "#22C55E",
                }}
              ></i>
            ) : (
              <i
                className="bi bi-clock"
                style={{
                  color: "#F59E0B",
                }}
              ></i>
            )}
          </div>
        </NavLink>
      ))}
    </div>
  );
}

export default Sidebar;