import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import toast from "react-hot-toast";
import { Search, Edit, Trash2, ArrowLeft, Calendar } from "lucide-react";
import Select from "react-select";
import "../css/conference.css";

const COUNTRIES = [
  "United States", "United Kingdom", "Canada", "Australia", "Germany", 
  "France", "Japan", "China", "India", "Brazil", "South Africa", "Other"
].map(c => ({ value: c, label: c }));

function Conference() {
  const navigate = useNavigate();
  const [conferences, setConferences] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [sortKey, setSortKey] = useState("date"); // "date" or "name"
  const [editId, setEditId] = useState(null);

  const initialFormState = {
    conference_name: "",
    venue: "",
    country: "",
    start_date: "",
    end_date: "",
    organizer: "",
    presentation_title: "",
    participation_type: "Presenter",
    registration_status: "Registered",
    description: ""
  };

  const [formData, setFormData] = useState(initialFormState);

  useEffect(() => {
    fetchConferences();
  }, []);

  const fetchConferences = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await API.get("/conference", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setConferences(response.data);
    } catch (error) {
      console.log(error);
      toast.error("Failed to fetch conferences");
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validateForm = () => {
    if (!formData.conference_name || !formData.venue || !formData.start_date || !formData.end_date || !formData.organizer) {
      toast.error("Conference Name, Venue, Start Date, End Date, and Organizer are required");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      const token = localStorage.getItem("token");
      const config = { headers: { Authorization: `Bearer ${token}` } };

      if (editId) {
        await API.put(`/conference/${editId}`, formData, config);
        toast.success("Conference Updated");
      } else {
        await API.post("/conference", formData, config);
        toast.success("Conference Registered");
      }

      setFormData(initialFormState);
      setEditId(null);
      fetchConferences();
    } catch (error) {
      console.log(error);
      toast.error("Server Error");
    }
  };

  const handleEdit = (conf) => {
    setEditId(conf.id);
    setFormData({
      conference_name: conf.conference_name || "",
      venue: conf.venue || "",
      country: conf.country || "",
      start_date: conf.start_date || "",
      end_date: conf.end_date || "",
      organizer: conf.organizer || "",
      presentation_title: conf.presentation_title || "",
      participation_type: conf.participation_type || "Presenter",
      registration_status: conf.registration_status || "Registered",
      description: conf.description || ""
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    try {
      const token = localStorage.getItem("token");
      await API.delete(`/conference/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success("Conference Deleted");
      fetchConferences();
    } catch (error) {
      console.log(error);
      toast.error("Failed to delete conference");
    }
  };

  const handleClear = () => {
    setFormData(initialFormState);
    setEditId(null);
  }

  const filteredConferences = conferences
    .filter(conf => 
      (conf.conference_name || "").toLowerCase().includes(searchQuery.toLowerCase()) || 
      (conf.venue || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (conf.country || "").toLowerCase().includes(searchQuery.toLowerCase())
    )
    .filter(conf => statusFilter ? conf.registration_status === statusFilter : true)
    .sort((a, b) => {
      if (sortKey === "date") {
        return new Date(b.start_date) - new Date(a.start_date);
      }
      return a.conference_name.localeCompare(b.conference_name);
    });

  return (
    <div className="conference-container">
      <button className="back-btn" onClick={() => navigate("/dashboard")}>
        <ArrowLeft size={18} /> Dashboard
      </button>

      <div className="conference-card">
        <h2><Calendar size={28} color="#3182ce" /> Conference Management</h2>
        
        <form className="conf-form" onSubmit={handleSubmit}>
          <div className="form-group full-width">
            <label>Conference Name *</label>
            <input type="text" name="conference_name" value={formData.conference_name} onChange={handleChange} placeholder="Enter conference name" required />
          </div>

          <div className="form-group">
            <label>Venue *</label>
            <input type="text" name="venue" value={formData.venue} onChange={handleChange} placeholder="Hotel/University" required />
          </div>

          <div className="form-group" style={{marginBottom: "15px"}}>
            <label>Country</label>
            <Select 
              options={COUNTRIES}
              value={COUNTRIES.find(c => c.value === formData.country) || (formData.country ? { value: formData.country, label: formData.country } : null)}
              onChange={(selected) => setFormData({ ...formData, country: selected ? selected.value : "" })}
              placeholder="Select Country..."
              isClearable
              className="react-select-container"
              classNamePrefix="react-select"
            />
          </div>

          <div className="form-group">
            <label>Start Date *</label>
            <input type="date" name="start_date" value={formData.start_date} onChange={handleChange} required />
          </div>

          <div className="form-group">
            <label>End Date *</label>
            <input type="date" name="end_date" value={formData.end_date} onChange={handleChange} required />
          </div>

          <div className="form-group">
            <label>Organizer *</label>
            <input type="text" name="organizer" value={formData.organizer} onChange={handleChange} placeholder="University/Organization" required />
          </div>

          <div className="form-group">
            <label>Presentation Title</label>
            <input type="text" name="presentation_title" value={formData.presentation_title} onChange={handleChange} placeholder="Enter presentation title" />
          </div>

          <div className="form-group">
            <label>Participation Type</label>
            <select name="participation_type" value={formData.participation_type} onChange={handleChange}>
              <option value="Presenter">Presenter</option>
              <option value="Attendee">Attendee</option>
              <option value="Keynote Speaker">Keynote Speaker</option>
              <option value="Panelist">Panelist</option>
              <option value="Organizer">Organizer</option>
            </select>
          </div>

          <div className="form-group">
            <label>Registration Status</label>
            <select name="registration_status" value={formData.registration_status} onChange={handleChange}>
              <option value="Registered">Registered</option>
              <option value="Accepted">Accepted</option>
              <option value="Presented">Presented</option>
              <option value="Completed">Completed</option>
            </select>
          </div>

          <div className="form-group full-width">
            <label>Description</label>
            <input type="text" name="description" value={formData.description} onChange={handleChange} placeholder="Any notes" />
          </div>

          <button type="submit" className="submit-btn">
            {editId ? "Update" : "Register Conference"}
          </button>
          
          <button type="button" className="clear-btn" onClick={handleClear}>
            Clear
          </button>
        </form>
      </div>

      <div className="conference-card">
        <div className="controls-container">
          <div className="search-bar">
            <Search size={20} />
            <input 
              type="text" 
              placeholder="Search conferences..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="filter-select" style={{marginLeft: '10px', padding: '0.5rem', borderRadius: '10px', border: '1px solid #cbd5e0'}}>
              <option value="">All Statuses</option>
              <option value="Registered">Registered</option>
              <option value="Accepted">Accepted</option>
              <option value="Presented">Presented</option>
              <option value="Completed">Completed</option>
            </select>
          </div>
          <div className="sort-controls">
            <button type="button" className={`sort-btn ${sortKey === 'date' ? 'active' : ''}`} onClick={() => setSortKey('date')}>
              Sort by Date
            </button>
            <button type="button" className={`sort-btn ${sortKey === 'name' ? 'active' : ''}`} onClick={() => setSortKey('name')}>
              Sort by Name
            </button>
          </div>
        </div>

        <div className="table-responsive">
          <table className="conf-table">
            <thead>
              <tr>
                <th>Conference Name</th>
                <th>Venue & Country</th>
                <th>Dates</th>
                <th>Organizer</th>
                <th>Participation</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredConferences.map(conf => (
                <tr key={conf.id}>
                  <td>{conf.conference_name}</td>
                  <td>{[conf.venue, conf.country].filter(Boolean).join(", ")}</td>
                  <td>{`${conf.start_date} to ${conf.end_date}`}</td>
                  <td>{conf.organizer}</td>
                  <td>{conf.participation_type || "N/A"}</td>
                  <td>{conf.registration_status}</td>
                  <td>
                    <div className="action-btns">
                      <button className="edit-btn" onClick={() => handleEdit(conf)} title="Edit">
                        <Edit size={16} />
                      </button>
                      <button className="delete-btn" onClick={() => handleDelete(conf.id)} title="Delete">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredConferences.length === 0 && (
                <tr>
                  <td colSpan="7" style={{ textAlign: "center", padding: "2rem" }}>No conferences found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Conference;
