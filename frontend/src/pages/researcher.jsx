import "../css/researcher.css";
import { useState } from "react";
import API from "../services/api";

function Researcher() {
  const [institution, setInstitution] = useState("");
  const [department, setDepartment] = useState("");
  const [research_interest, setResearchInterest] = useState("");
  const [bio, setBio] = useState("");

  const createResearcher = async () => {
    try {
      const token = localStorage.getItem("token");

      const response = await API.post(
        "/researcher",
        {
          institution,
          department,
          research_interest,
          bio,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert(response.data.message);

    } catch (error) {
      console.log(error.response?.data);
      alert("Researcher Profile Creation Failed");
    }
  };

  return (
    <div className="researcher-container">
      <div className="researcher-card">

        <h2>Researcher Profile</h2>

        <input
          type="text"
          placeholder="Institution"
          value={institution}
          onChange={(e) => setInstitution(e.target.value)}
        />

        <input
          type="text"
          placeholder="Department"
          value={department}
          onChange={(e) => setDepartment(e.target.value)}
        />

        <input
          type="text"
          placeholder="Research Interest"
          value={research_interest}
          onChange={(e) => setResearchInterest(e.target.value)}
        />

        <textarea
          placeholder="Bio"
          value={bio}
          onChange={(e) => setBio(e.target.value)}
        ></textarea>

        <button onClick={createResearcher}>
          Save Profile
        </button>

      </div>
    </div>
  );
}

export default Researcher;