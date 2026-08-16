<<<<<<< HEAD
import { useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { Turnstile } from "@marsidev/react-turnstile";

=======
import { useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { Turnstile } from "@marsidev/react-turnstile";
>>>>>>> origin/P-Lakshmi-Sravani
import { loginUser } from "../services/authService";
import { useAuth } from "../hooks/useAuth";
import { getDashboardPathForRole } from "../utils/roleRedirect";
import "../styles/auth.css";

function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
<<<<<<< HEAD

  const turnstileRef = useRef(null);

=======
  const turnstileRef = useRef(null);
>>>>>>> origin/P-Lakshmi-Sravani
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
<<<<<<< HEAD

=======
>>>>>>> origin/P-Lakshmi-Sravani
    const captchaToken = turnstileRef.current?.getResponse();

    if (!captchaToken) {
      toast.error("Please complete the CAPTCHA.");
      return;
    }
<<<<<<< HEAD

    setLoading(true);

    try {
      const data = await loginUser({
        username,
        password,
        captcha_token: captchaToken,
      });

      // MFA is required → go to OTP verification page
      if (data.mfa_required) {
        navigate("/verify-otp", {
          state: { userId: data.user_id },
        });
        return;
      }

      // Fallback for direct token response
      login(data);
=======
    setLoading(true);

    try {
      const data = await loginUser({ username, password, captcha_token: captchaToken, });
      if (data.mfa_required) {
    navigate("/verify-otp", { state: { userId: data.user_id } });
  } else {
    // Fallback in case backend ever returns a direct token (shouldn't happen with MFA enabled)
    login(data);
>>>>>>> origin/P-Lakshmi-Sravani

      // Force password change if required
      if (data.must_reset_password) {
        navigate("/change-password");
      } else {
        navigate(getDashboardPathForRole(data.role));
      }
    }
    } catch (err) {
      const detail = err?.response?.data?.detail;

      toast.error(detail || "Invalid username or password.");

      // Reset CAPTCHA so the user gets a fresh token
      turnstileRef.current?.reset();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>Log in</h1>

        <p className="auth-sub">
          New researcher? <Link to="/register">Register here</Link>
        </p>

        <form onSubmit={handleSubmit}>
          <label>Username</label>

          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />

          <label>Password</label>
<<<<<<< HEAD

          <input
            type="password"
            name="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

=======
          <input type="password" name="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} required />
>>>>>>> origin/P-Lakshmi-Sravani
          <Turnstile
            ref={turnstileRef}
            siteKey={import.meta.env.VITE_TURNSTILE_SITE_KEY}
          />

<<<<<<< HEAD
          <button
            type="submit"
            className="btn-primary btn-block"
            disabled={loading}
          >
=======
          <button type="submit" className="btn-primary btn-block" disabled={loading}>
>>>>>>> origin/P-Lakshmi-Sravani
            {loading ? "Logging in..." : "Log in"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default LoginPage;