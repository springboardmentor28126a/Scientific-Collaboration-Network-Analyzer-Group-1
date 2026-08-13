import { useState, useEffect } from "react";
import {
  createResearcherProfile,
  updateResearcherProfile,
} from "../services/researcherProfileApi";
import "./ResearcherProfile.css";

function ResearcherProfileForm({
  selectedProfile,
  setSelectedProfile,
  refreshProfiles,
}) {
  const [formData, setFormData] = useState({
    user_id: "",
    institution_id: "",
    department_id: "",
    designation: "",
    research_area: "",
    bio: "",
  });

  useEffect(() => {
    if (selectedProfile) {
      setFormData({
        user_id: selectedProfile.user_id,
        institution_id: selectedProfile.institution_id,
        department_id: selectedProfile.department_id,
        designation: selectedProfile.designation,
        research_area: selectedProfile.research_area,
        bio: selectedProfile.bio,
      });
    }
  }, [selectedProfile]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const clearForm = () => {
    setFormData({
      user_id: "",
      institution_id: "",
      department_id: "",
      designation: "",
      research_area: "",
      bio: "",
    });

    setSelectedProfile(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const payload = {
        user_id: Number(formData.user_id),
        institution_id: Number(formData.institution_id),
        department_id: Number(formData.department_id),
        designation: formData.designation,
        research_area: formData.research_area,
        bio: formData.bio,
      };

      if (selectedProfile) {
        await updateResearcherProfile(selectedProfile.id, payload);
        alert("Profile updated successfully.");
      } else {
        await createResearcherProfile(payload);
        alert("Profile created successfully.");
      }

      clearForm();
      refreshProfiles();
    } catch (error) {
      console.error(error);
      alert("Operation failed.");
    }
  };

  return (
    <div className="page-container">
      <div className="card">
        <h2>
          {selectedProfile
            ? "Update Researcher Profile"
            : "Create Researcher Profile"}
        </h2>

        <form onSubmit={handleSubmit}>
          <div className="form-grid">

            <div className="form-group">
              <label>User ID</label>
              <input
                type="number"
                name="user_id"
                value={formData.user_id}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Institution ID</label>
              <input
                type="number"
                name="institution_id"
                value={formData.institution_id}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Department ID</label>
              <input
                type="number"
                name="department_id"
                value={formData.department_id}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Designation</label>
              <input
                type="text"
                name="designation"
                value={formData.designation}
                onChange={handleChange}
              />
            </div>

            <div className="form-group full-width">
              <label>Research Area</label>
              <input
                type="text"
                name="research_area"
                value={formData.research_area}
                onChange={handleChange}
              />
            </div>

            <div className="form-group full-width">
              <label>Bio</label>
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleChange}
              />
            </div>

          </div>

          <button className="submit-btn" type="submit">
            {selectedProfile ? "Update Profile" : "Create Profile"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default ResearcherProfileForm;