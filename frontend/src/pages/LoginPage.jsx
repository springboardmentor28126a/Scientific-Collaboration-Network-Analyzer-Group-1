import { useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { Turnstile } from "@marsidev/react-turnstile";
import { loginUser } from "../services/authService";
import { useAuth } from "../hooks/useAuth";
import { getDashboardPathForRole } from "../utils/roleRedirect";
import "../styles/auth.css";

function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const turnstileRef = useRef(null);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const captchaToken = turnstileRef.current?.getResponse();

    if (!captchaToken) {
      toast.error("Please complete the CAPTCHA.");
      return;
    }
    setLoading(true);

    try {
      const data = await loginUser({ username, password, captcha_token: captchaToken, });
      if (data.mfa_required) {
    navigate("/verify-otp", { state: { userId: data.user_id } });
  } else {
    // Fallback in case backend ever returns a direct token (shouldn't happen with MFA enabled)
    login(data);

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
          <input value={username} onChange={(e) => setUsername(e.target.value)} required />

          <label>Password</label>
          <input type="password" name="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          <Turnstile
            ref={turnstileRef}
            siteKey={import.meta.env.VITE_TURNSTILE_SITE_KEY}
          />

          <button type="submit" className="btn-primary btn-block" disabled={loading}>
            {loading ? "Logging in..." : "Log in"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default LoginPage;