import { Link } from "react-router-dom";

function Dashboard() {
  return (
    <div style={{ padding: "30px" }}>
      <h1>Dashboard</h1>

      <h2>Welcome to Scientific Collaboration Network Analyzer</h2>

      <hr />

      <h3>Researcher Management</h3>

      <Link to="/add-researcher">
        <button>Add Researcher</button>
      </Link>

      <br /><br />

      <Link to="/researcher">
        <button>View Researchers</button>
      </Link>

      <br /><br />

      <Link to="/">
        <button>Logout</button>
      </Link>

    </div>
  );
}

export default Dashboard;