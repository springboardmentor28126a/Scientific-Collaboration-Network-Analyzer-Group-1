import { UserRound, BookOpen, Network, Search } from "lucide-react";
import Navbar from "../components/Navbar";
import { useNavigate } from "react-router-dom";

function Researchers() {
  const navigate = useNavigate();
  return (
    <div className="researchers-page">

    <Navbar />
      <h1>Researchers</h1>

      <p className="page-description">
        Explore researcher profiles, publications and scientific collaboration networks.
      </p>
<button
  className="back-btn"
  onClick={() => navigate("/")}
>
  Back to Home
</button>

      <div className="search-box">

        <Search className="search-icon" />

        <input
          type="text"
          placeholder="Search researchers..."
        />

      </div>


      <div className="researcher-features">


        <div className="feature-card">
          <UserRound className="feature-icon" />
          <h3>Research Profiles</h3>
          <p>
            Manage and explore researcher information.
          </p>
        </div>


        <div className="feature-card">
          <BookOpen className="feature-icon" />
          <h3>Publications</h3>
          <p>
            Analyze scientific publications and contributions.
          </p>
        </div>


        <div className="feature-card">
          <Network className="feature-icon" />
          <h3>Collaboration Network</h3>
          <p>
            Visualize connections between researchers.
          </p>
        </div>


      </div>


    </div>
  );
}

export default Researchers;