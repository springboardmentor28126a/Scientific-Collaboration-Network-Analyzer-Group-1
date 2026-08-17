import "../styles/navbar.css";

function Navbar() {
  const today = new Date().toLocaleDateString("en-GB");

  return (
    /*<nav className="navbar">
  <div className="navbar-logo">
    🔬 <span>SCNA Dashboard</span>
  </div>

  <div className="navbar-right">
    <div className="status">🟢 Online</div>
    <div className="user">👤 Pankaj Sharma</div>
    <div className="date">📅 {today}</div>
  </div>
</nav>*/
  <nav
    style={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      background: "#111",
      height: "75px",
      padding: "0 25px",
      width: "100%",
      boxSizing: "border-box",
    }}
  >
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "10px",
        fontSize: "30px",
        fontWeight: "bold",
        color: "#ff3b3b",
      }}
    >
      🔬 SCNA Dashboard
    </div>

    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "20px",
      }}
    >
      <span style={{ color: "#22c55e" }}>🟢 Online</span>
      <span>👤 Pankaj Sharma</span>
      <span>📅 {today}</span>
    </div>
  </nav>
);

}

export default Navbar;