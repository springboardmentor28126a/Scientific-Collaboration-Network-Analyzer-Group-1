import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";

import { verifyOtp } from "../services/authService";
import { useAuth } from "../hooks/useAuth";
import { getDashboardPathForRole } from "../utils/roleRedirect";
import "../styles/auth.css";

function OtpVerificationPage() {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const userId = location.state?.userId;

  if (!userId) {
    navigate("/login");
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = await verifyOtp(userId, code);
      login(data);

      if (data.must_reset_password) {
        navigate("/change-password");
      } else {
        navigate(getDashboardPathForRole(data.role));
      }
    } catch (err) {
      toast.error(err?.response?.data?.detail || "Invalid or expired code.");
      setCode("");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>Enter verification code</h1>
        <p className="auth-sub">
          We've sent a 6-digit code to your registered email. It expires in 5 minutes.
        </p>

        <form onSubmit={handleSubmit}>
          <label>Verification code</label>
          <input
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
            maxLength={6}
            placeholder="123456"
            autoFocus
            required
            style={{ letterSpacing: "0.3em", fontFamily: "monospace", fontSize: "1.2rem", textAlign: "center" }}
          />

          <button type="submit" className="btn-primary btn-block" disabled={loading || code.length !== 6}>
            {loading ? "Verifying..." : "Verify and log in"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default OtpVerificationPage;