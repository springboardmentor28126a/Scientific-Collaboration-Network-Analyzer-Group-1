import { Link, useNavigate } from "react-router-dom";

import { useAuth } from "../../hooks/useAuth";

function Navbar() {

  const navigate = useNavigate();

  const { auth, logout } = useAuth();

  const handleLogout = () => {

    logout();

    navigate("/login");

  };

  return (

    <nav
      className="navbar navbar-expand-lg navbar-dark shadow-sm"
      style={{
        backgroundColor: "#0F172A",
        height: "70px",
      }}
    >

      <div className="container-fluid">

        {/* Logo */}

        <Link
          className="navbar-brand fw-bold fs-4"
          to="/"
        >

          <i className="bi bi-diagram-3-fill me-2"></i>

          SCNA

        </Link>

        {/* Mobile Toggle */}

        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarContent"
        >

          <span className="navbar-toggler-icon"></span>

        </button>

        <div
          className="collapse navbar-collapse"
          id="navbarContent"
        >

          {/* Search */}

          <form className="d-flex mx-auto w-50">

            <input
              className="form-control"
              type="search"
              placeholder="Search Researchers, Publications..."
            />

          </form>

          {/* Right Side */}

          <ul className="navbar-nav ms-auto align-items-center">

            {/* Notification */}

            <li className="nav-item me-3">

              <i
                className="bi bi-bell fs-5 text-white"
                style={{
                  cursor: "pointer",
                }}
              ></i>

            </li>

            {/* User */}

            <li className="nav-item dropdown">

              <a
                href="#"
                className="nav-link dropdown-toggle text-white"
                role="button"
                data-bs-toggle="dropdown"
              >

                <i className="bi bi-person-circle me-2"></i>

                {auth?.username ?? "User"}

              </a>

              <ul className="dropdown-menu dropdown-menu-end shadow">

                <li>

                  <h6 className="dropdown-header">

                    Signed in as

                  </h6>

                </li>

                <li>

                  <span className="dropdown-item-text fw-bold">

                    {auth?.username}

                  </span>

                </li>

                <li>

                  <span className="dropdown-item-text text-muted small">

                    {auth?.role}

                  </span>

                </li>

                <li>

                  <hr className="dropdown-divider" />

                </li>

                <li>

                  <button
                    className="dropdown-item"
                    type="button"
                  >

                    <i className="bi bi-person me-2"></i>

                    Profile

                  </button>

                </li>

                <li>

                  <button
                    className="dropdown-item"
                    type="button"
                  >

                    <i className="bi bi-gear me-2"></i>

                    Settings

                  </button>

                </li>

                <li>

                  <hr className="dropdown-divider" />

                </li>

                <li>

                  <button
                    className="dropdown-item text-danger"
                    type="button"
                    onClick={handleLogout}
                  >

                    <i className="bi bi-box-arrow-right me-2"></i>

                    Logout

                  </button>

                </li>

              </ul>

            </li>

          </ul>

        </div>

      </div>

    </nav>

  );

}

export default Navbar;