import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

import { changePassword } from "../services/authService";
import { useAuth } from "../hooks/useAuth";
import { getDashboardPathForRole } from "../utils/roleRedirect";
import "../styles/auth.css";

function ChangePasswordPage() {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { auth, login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      await changePassword({ old_password: oldPassword, new_password: newPassword });
      toast.success("Password updated. Please continue.");

      const updatedAuth = { ...auth, must_reset_password: false };
      login(updatedAuth);

      navigate(getDashboardPathForRole(auth.role));
    } catch (err) {
      toast.error(err?.response?.data?.detail || "Could not update password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>Set a new password</h1>
        <p className="auth-sub">Your account was created by an admin. Set your own password to continue.</p>

        <form onSubmit={handleSubmit}>
          <label>Current (temporary) password</label>
          <input type="password" value={oldPassword} onChange={(e) => setOldPassword(e.target.value)} required />

          <label>New password</label>
          <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required />

          <label>Confirm new password</label>
          <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />

          <button type="submit" className="btn-primary btn-block" disabled={loading}>
            {loading ? "Updating..." : "Update password"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default ChangePasswordPage;