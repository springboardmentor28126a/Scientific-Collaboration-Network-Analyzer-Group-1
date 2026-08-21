import { FileCheck, Search, ClipboardCheck } from "lucide-react";
import Navbar from "../components/Navbar";
import { useNavigate } from "react-router-dom";

function Reviewers() {
     const navigate = useNavigate();
  return (
    <div className="reviewers-page">
     <Navbar />
   
      <h1>Reviewers</h1>

      <p className="page-description">
        Manage research evaluation activities and review workflows.
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
          placeholder="Search reviews..."
        />

      </div>


      <div className="reviewer-features">


        <div className="feature-card">

          <FileCheck className="feature-icon" />

          <h3>Review Management</h3>

          <p>
            Organize and manage research review activities.
          </p>

        </div>



        <div className="feature-card">

          <ClipboardCheck className="feature-icon" />

          <h3>Review Tracking</h3>

          <p>
            Monitor progress and review status.
          </p>

        </div>



        <div className="feature-card">

          <FileCheck className="feature-icon" />

          <h3>Evaluation Records</h3>

          <p>
            Maintain research evaluation information.
          </p>

        </div>


      </div>


    </div>
  );
}

export default Reviewers;