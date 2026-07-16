import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import toast from "react-hot-toast";
import { ArrowLeft, User, Building, BookOpen, Calendar, Mail, Edit3, Save, X, Briefcase, GraduationCap } from "lucide-react";
import Select from "react-select";
import "../css/researcher.css";

const DEPARTMENTS = [
  "Computer Science", "Physics", "Mathematics", "Biology", 
  "Chemistry", "Engineering", "Medicine", "Social Sciences", 
  "Humanities", "Other"
];

const ACADEMIC_POSITIONS = [
  "Professor", "Associate Professor", "Assistant Professor", 
  "Postdoctoral Researcher", "PhD Student", "Master Student", 
  "Research Scientist", "Industry Researcher", "Other"
];

const RESEARCH_INTERESTS_OPTIONS = [
  { value: "Artificial Intelligence", label: "Artificial Intelligence" },
  { value: "Machine Learning", label: "Machine Learning" },
  { value: "Data Science", label: "Data Science" },
  { value: "Quantum Computing", label: "Quantum Computing" },
  { value: "Bioinformatics", label: "Bioinformatics" },
  { value: "Cybersecurity", label: "Cybersecurity" },
  { value: "Robotics", label: "Robotics" },
  { value: "Nanotechnology", label: "Nanotechnology" },
  { value: "Neuroscience", label: "Neuroscience" },
  { value: "Climate Science", label: "Climate Science" }
];

function Researcher() {
  const navigate = useNavigate();

  // Mode state
  const [viewMode, setViewMode] = useState(true);
  const [profileExists, setProfileExists] = useState(false);

  // User and Stats from Dashboard logic
  const [user, setUser] = useState({ name: "", email: "" });
  const [stats, setStats] = useState({ total_publications: 0, total_conferences: 0, my_institution: "No Institution Assigned" });

  // Form State
  const [department, setDepartment] = useState("");
  const [academic_position, setAcademicPosition] = useState("");
  const [research_interest, setResearchInterest] = useState("");
  const [bio, setBio] = useState("");
  const [institution_id, setInstitutionId] = useState("");
  const [institutions, setInstitutions] = useState([]);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      const token = localStorage.getItem("token");
      const config = { headers: { Authorization: `Bearer ${token}` } };
      
      // Fetch Institutions for Dropdown
      API.get("/institution/all", config).then(res => setInstitutions(res.data)).catch(console.error);

      // Fetch User & Stats
      const [profileRes, statsRes] = await Promise.all([
        API.get("/profile", config),
        API.get("/dashboard-stats", config)
      ]);
      setUser(profileRes.data.user);
      setStats(statsRes.data);

      // Fetch Researcher specific data
      try {
        const resMe = await API.get("/researcher/me", config);
        if (resMe.data) {
          setInstitutionId(resMe.data.institution_id || "");
          setDepartment(resMe.data.department || "");
          setAcademicPosition(resMe.data.academic_position || "");
          setResearchInterest(resMe.data.research_interest || "");
          setBio(resMe.data.bio || "");
          setProfileExists(true);
        }
      } catch (e) {
        // No existing profile, stay in View Mode but will show empty
        setProfileExists(false);
      }

    } catch (error) {
      console.log(error);
      toast.error("Failed to load profile data");
    }
  };

  const saveProfile = async () => {
    try {
      const token = localStorage.getItem("token");
      const payload = {
        institution_id: institution_id ? parseInt(institution_id) : null,
        department,
        academic_position,
        research_interest,
        bio,
      };

      if (profileExists) {
        await API.put("/researcher", payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success("Profile Updated Successfully");
      } else {
        await API.post("/researcher", payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success("Profile Created Successfully");
        setProfileExists(true);
      }
      
      setViewMode(true);
      fetchInitialData(); // Refresh stats and institution name

    } catch (error) {
      console.log(error.response?.data);
      toast.error(error.response?.data?.detail || "Action Failed");
    }
  };

  const cancelEdit = () => {
    setViewMode(true);
    fetchInitialData(); // Reset to original values
  };

  // Helper to get institution name for View Mode
  const currentInstitution = institutions.find(i => i.id === parseInt(institution_id))?.institution_name || stats.my_institution;

  return (
    <div className="researcher-container">
      <button className="back-btn" onClick={() => navigate("/dashboard")}>
        <ArrowLeft size={18} /> Dashboard
      </button>

      <div className="profile-wrapper">
        {/* Top Banner Section */}
        <div className="profile-banner">
          <div className="profile-avatar-container">
            <div className="profile-avatar">
              <User size={60} color="#fff" />
            </div>
          </div>
          {viewMode && (
            <button className="edit-profile-btn" onClick={() => setViewMode(false)}>
              <Edit3 size={16} /> Edit Profile
            </button>
          )}
        </div>

        {/* Profile Header Info */}
        <div className="profile-header-info">
          <h1>{user.name}</h1>
          <p className="headline">{research_interest || "Researcher"}</p>
          <div className="contact-badges">
            <span className="badge"><Mail size={14} /> {user.email}</span>
            <span className="badge"><Building size={14} /> {currentInstitution}</span>
          </div>
          <p className="short-bio">{bio || "Add a short bio to describe yourself and your work."}</p>
        </div>

        {/* Stats Section */}
        <div className="profile-stats">
          <div className="p-stat-card">
            <BookOpen size={24} color="#3182ce" />
            <div className="p-stat-info">
              <h3>{stats.total_publications}</h3>
              <p>Total Publications</p>
            </div>
          </div>
          <div className="p-stat-card">
            <Calendar size={24} color="#3182ce" />
            <div className="p-stat-info">
              <h3>{stats.total_conferences}</h3>
              <p>Conferences Attended</p>
            </div>
          </div>
          <div className="p-stat-card">
            <GraduationCap size={24} color="#3182ce" />
            <div className="p-stat-info">
              <h3>Institution</h3>
              <p>{currentInstitution}</p>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="profile-content">
          {viewMode ? (
            // VIEW MODE
            <div className="view-mode-section">
              <div className="content-card">
                <h2><Briefcase size={20} /> Academic Information</h2>
                <div className="info-grid">
                  <div className="info-item">
                    <label>Institution</label>
                    <p>{currentInstitution}</p>
                  </div>
                  <div className="info-item">
                    <label>Department</label>
                    <p>{department || "Not specified"}</p>
                  </div>
                  <div className="info-item">
                    <label>Academic Position</label>
                    <p>{academic_position || "Not specified"}</p>
                  </div>
                  <div className="info-item">
                    <label>Research Interests</label>
                    <p>{research_interest || "Not specified"}</p>
                  </div>
                </div>
              </div>

              <div className="content-card">
                <h2><User size={20} /> About Me</h2>
                <div className="info-item">
                  <p>{bio || "No biography provided."}</p>
                </div>
              </div>
            </div>
          ) : (
            // EDIT MODE
            <div className="edit-mode-section">
              <div className="content-card edit-card">
                <h2><Edit3 size={20} /> {profileExists ? "Edit Researcher Profile" : "Create Researcher Profile"}</h2>
                
                <div className="form-group full-width">
                  <label>Institution</label>
                  <select
                    value={institution_id}
                    onChange={(e) => setInstitutionId(e.target.value)}
                  >
                    <option value="">Select Institution...</option>
                    {institutions.map(inst => (
                      <option key={inst.id} value={inst.id}>{inst.institution_name}</option>
                    ))}
                  </select>
                  <small>If your institution is not listed, an Institution Admin must create it.</small>
                </div>

                <div className="form-group">
                  <label>Department</label>
                  <select value={department} onChange={(e) => setDepartment(e.target.value)}>
                    <option value="">Select Department...</option>
                    {DEPARTMENTS.map(dep => <option key={dep} value={dep}>{dep}</option>)}
                  </select>
                </div>

                <div className="form-group">
                  <label>Academic Position (Optional)</label>
                  <select value={academic_position} onChange={(e) => setAcademicPosition(e.target.value)}>
                    <option value="">Select Position...</option>
                    {ACADEMIC_POSITIONS.map(pos => <option key={pos} value={pos}>{pos}</option>)}
                  </select>
                </div>

                <div className="form-group full-width" style={{marginBottom: "15px"}}>
                  <label>Research Interests</label>
                  <Select 
                    isMulti
                    options={RESEARCH_INTERESTS_OPTIONS}
                    value={research_interest.split(", ").filter(Boolean).map(val => ({ value: val, label: val }))}
                    onChange={(selected) => setResearchInterest(selected.map(s => s.value).join(", "))}
                    placeholder="Search and select research interests..."
                    className="react-select-container"
                    classNamePrefix="react-select"
                  />
                </div>

                <div className="form-group full-width">
                  <label>About Me (Bio)</label>
                  <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Write a short biography..."
                    rows="4"
                  ></textarea>
                </div>

                <div className="form-actions">
                  <button className="cancel-btn" onClick={cancelEdit}>
                    <X size={16} /> Cancel
                  </button>
                  <button className="save-btn" onClick={saveProfile}>
                    <Save size={16} /> Save Profile
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Researcher;