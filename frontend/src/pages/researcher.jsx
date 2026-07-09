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
      console.log(response.data);

    } catch (error) {
      console.log(error.response?.data);
      alert("Researcher Profile Creation Failed");
    }
  };

  return (
    <div>
      <h2>Researcher Profile</h2>

      <input
        type="text"
        placeholder="Institution"
        onChange={(e) => setInstitution(e.target.value)}
      />

      <br /><br />

      <input
        type="text"
        placeholder="Department"
        onChange={(e) => setDepartment(e.target.value)}
      />

      <br /><br />

      <input
        type="text"
        placeholder="Research Interest"
        onChange={(e) => setResearchInterest(e.target.value)}
      />

      <br /><br />

      <textarea
        placeholder="Bio"
        onChange={(e) => setBio(e.target.value)}
      />

      <br /><br />

      <button onClick={createResearcher}>
        Save Profile
      </button>
    </div>
  );
}

export default Researcher;