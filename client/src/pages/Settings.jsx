import { useEffect, useState } from "react";

function Settings({ toggleTheme }) {
  const user = JSON.parse(localStorage.getItem("user"));
  const [notifications, setNotifications] = useState(true);
  const [emailUpdates, setEmailUpdates] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const settings = JSON.parse(localStorage.getItem("scna_settings"));
    if (settings) {
      setNotifications(settings.notifications ?? true);
      setEmailUpdates(settings.emailUpdates ?? true);
    }
  }, []);

  const savePreferences = () => {
    setSaving(true);
    try {
      localStorage.setItem(
        "scna_settings",
        JSON.stringify({ notifications, emailUpdates })
      );
      alert("Preferences saved successfully.");
    } catch (error) {
      console.error(error);
      alert("Unable to save settings at this time.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ padding: "30px" }}>
      <h1>⚙ User Settings</h1>
      <p style={{ color: "var(--muted)", maxWidth: "720px" }}>
        Personalize your research collaboration experience and control your notification preferences.
      </p>

      <div style={{ display: "grid", gap: "24px", marginTop: "30px", maxWidth: "760px" }}>
        <section style={sectionCard}>
          <h2>Appearance</h2>
          <p style={{ color: "var(--muted)", marginTop: "10px" }}>
            Choose your theme.
          </p>
          <button style={themeToggleButton} onClick={toggleTheme}>
            Switch Theme
          </button>
        </section>

        <section style={sectionCard}>
          <h2>Profile</h2>
          <div style={profileRow}>
            <div>
              <p style={sectionLabel}>Name</p>
              <p>{user?.name || "—"}</p>
            </div>
            <div>
              <p style={sectionLabel}>Email</p>
              <p>{user?.email || "—"}</p>
            </div>
          </div>
        </section>

        <section style={sectionCard}>
          <h2>Notifications</h2>
          <label style={toggleRow}>
            <span>Email notifications</span>
            <input type="checkbox" checked={emailUpdates} onChange={() => setEmailUpdates((prev) => !prev)} />
          </label>
          <label style={toggleRow}>
            <span>In-app alerts</span>
            <input type="checkbox" checked={notifications} onChange={() => setNotifications((prev) => !prev)} />
          </label>
        </section>

        <section style={sectionCard}>
          <h2>Actions</h2>
          <button style={saveButton} onClick={savePreferences} disabled={saving}>
            {saving ? "Saving…" : "Save Preferences"}
          </button>
        </section>
      </div>
    </div>
  );
}

const sectionCard = {
  background: "var(--surface)",
  padding: "26px",
  borderRadius: "18px",
  boxShadow: "var(--shadow)",
  border: "1px solid var(--border)",
};

const profileRow = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))",
  gap: "18px",
  marginTop: "18px",
};

const sectionLabel = {
  margin: 0,
  color: "var(--muted)",
  fontSize: "14px",
};

const toggleRow = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "12px 0",
  borderBottom: "1px solid var(--border)",
  color: "var(--text)",
};

const saveButton = {
  background: "var(--accent)",
  color: "white",
  padding: "14px 22px",
  borderRadius: "12px",
  border: "none",
  cursor: "pointer",
  marginTop: "18px",
};

const themeToggleButton = {
  background: "var(--button-bg)",
  color: "var(--text)",
  padding: "14px 18px",
  borderRadius: "12px",
  border: "1px solid var(--border)",
  cursor: "pointer",
  fontWeight: 600,
  marginTop: "14px",
};

export default Settings;
