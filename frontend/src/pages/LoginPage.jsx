import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { loginUser } from "../services/authService";
import { useAuth } from "../hooks/useAuth";

import "../styles/auth.css";

function LoginPage() {

  const navigate = useNavigate();

  const { login } = useAuth();

  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  const handleChange = (event) => {

    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

  };

  const handleSubmit = async (event) => {

    event.preventDefault();

    setLoading(true);

    setError("");

    try {

      const response = await loginUser(formData);

      login(response);

      navigate("/");

    }

    catch {

      setError("Invalid username or password.");

    }

    finally {

      setLoading(false);

    }

  };

  return (

    <div className="auth-page">

      <div className="auth-card">

        <div className="auth-logo">

          <i className="bi bi-diagram-3-fill"></i>

        </div>

        <h2 className="auth-title">

          Scientific Collaboration

        </h2>

        <h4 className="auth-title mb-2">

          Network Analyzer

        </h4>

        <p className="auth-subtitle">

          Research Management Platform

        </p>

        {error && (

          <div className="alert alert-danger">

            {error}

          </div>

        )}

        <form onSubmit={handleSubmit}>

          <div className="mb-3">

            <label className="form-label fw-semibold">

              Username

            </label>

            <input
              type="text"
              className="form-control"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
            />

          </div>

          <div className="mb-4">

            <label className="form-label fw-semibold">

              Password

            </label>

            <input
              type="password"
              className="form-control"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
            />

          </div>

          <button
            className="btn btn-primary w-100 py-2"
            disabled={loading}
          >

            {loading ? (

              <>
                <span
                  className="spinner-border spinner-border-sm me-2"
                ></span>

                Signing In...

              </>

            ) : (

              "Login"

            )}

          </button>

        </form>

      </div>
      <div className="text-center mt-4">

  Don't have an account?

  <Link
    to="/register"
    className="ms-2"
  >

    Register

  </Link>

</div>

    </div>

  );

}

export default LoginPage;