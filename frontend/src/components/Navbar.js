import { Link } from "react-router-dom";

function NavigationBar() {
  return (
    <nav
      style={{
        padding: "15px",
        textAlign: "center",
        backgroundColor: "#f8f9fa",
      }}
    >
      <Link to="/">Home</Link>

      {" | "}

      <Link to="/login">Login</Link>

      {" | "}

      <Link to="/researcher">Researchers</Link>

      {" | "}

      <Link to="/publication">Publications</Link>

      {" | "}

      <Link to="/conference">Conferences</Link>

      {" | "}

      <Link to="/collaboration">Collaborations</Link>

      {" | "}

      <Link to="/project">Projects</Link>

      {" | "}

      <Link to="/reviewqueue">Review Queue</Link>

      {" | "}

      <Link to="/myreviews">My Reviews</Link>

      {" | "}

      <Link to="/institution">Institutions</Link>

    </nav>
  );
}

export default NavigationBar;