import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { toast } from "react-toastify";

import { registerUser } from "../services/authService";

import "../styles/auth.css";

function RegisterPage() {

  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({

    username: "",

    email: "",

    password: "",

    confirmPassword: "",

  });

  const handleChange = (event) => {

    const { name, value } = event.target;

    setFormData((previous) => ({

      ...previous,

      [name]: value,

    }));

  };

  const handleSubmit = async (event) => {

    event.preventDefault();

    if (formData.password !== formData.confirmPassword) {

      toast.error(
        "Passwords do not match."
      );

      return;

    }

    setLoading(true);

    try {

      await registerUser({

        username: formData.username,

        email: formData.email,

        password: formData.password,

      });

      toast.success(
        "Registration successful. Please login."
      );

      navigate("/login");

    }

    catch (error) {

      toast.error(

        error.response?.data?.detail ||

        "Registration failed."

      );

    }

    finally {

      setLoading(false);

    }

  };

  return (

    <div className="auth-page">

      <div className="auth-card">

        <div className="auth-logo">

          <i className="bi bi-person-plus-fill"></i>

        </div>

        <h2 className="auth-title">

          Create Account

        </h2>

        <p className="auth-subtitle">

          Scientific Collaboration Network Analyzer

        </p>

        <form onSubmit={handleSubmit}>

          <div className="mb-3">

            <label className="form-label">

              Username

            </label>

            <input
              className="form-control"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
            />

          </div>

          <div className="mb-3">

            <label className="form-label">

              Email

            </label>

            <input
              type="email"
              className="form-control"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />

          </div>

          <div className="mb-3">

            <label className="form-label">

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

          <div className="mb-4">

            <label className="form-label">

              Confirm Password

            </label>

            <input
              type="password"
              className="form-control"
              name="confirmPassword"
              value={formData.confirmPassword}
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
                <span className="spinner-border spinner-border-sm me-2"></span>

                Creating Account...

              </>

            ) : (

              "Register"

            )}

          </button>

        </form>

        <hr />

        <div className="text-center">

          Already have an account?

          <Link
            to="/login"
            className="ms-2"
          >

            Login

          </Link>

        </div>

      </div>

    </div>

  );

}

export default RegisterPage;