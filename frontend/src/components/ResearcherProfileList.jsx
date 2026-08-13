import { useEffect, useState } from "react";
import {
  getAllResearcherProfiles,
  deleteResearcherProfile,
} from "../services/researcherProfileApi";
import "./ResearcherProfile.css";

function ResearcherProfileList({
  setSelectedProfile,
  refresh,
  refreshProfiles,
}) {
  const [profiles, setProfiles] = useState([]);

  useEffect(() => {
    fetchProfiles();
  }, [refresh]);

  const fetchProfiles = async () => {
    try {
      const response = await getAllResearcherProfiles();
      setProfiles(response.data);
    } catch (error) {
      console.error("Error fetching profiles:", error);
    }
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this profile?"
    );

    if (!confirmDelete) return;

    try {
      await deleteResearcherProfile(id);

      alert("Profile deleted successfully.");

      refreshProfiles();
    } catch (error) {
      console.error(error);
      alert("Failed to delete profile.");
    }
  };

  const handleEdit = (profile) => {
    setSelectedProfile(profile);
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <div className="page-container">
      <div className="card">
        <h2>Researcher Profiles</h2>

        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>User ID</th>
              <th>Institution</th>
              <th>Department</th>
              <th>Designation</th>
              <th>Research Area</th>
              <th>Bio</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {profiles.length > 0 ? (
              profiles.map((profile) => (
                <tr key={profile.id}>
                  <td>{profile.id}</td>
                  <td>{profile.user_id}</td>
                  <td>{profile.institution_id}</td>
                  <td>{profile.department_id}</td>
                  <td>{profile.designation}</td>
                  <td>{profile.research_area}</td>
                  <td>{profile.bio}</td>

                  <td>
                    <button
                      className="edit-btn"
                      onClick={() => handleEdit(profile)}
                    >
                      Edit
                    </button>

                    <button
                      className="delete-btn"
                      onClick={() => handleDelete(profile.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8" style={{ textAlign: "center" }}>
                  No Researcher Profiles Found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ResearcherProfileList;