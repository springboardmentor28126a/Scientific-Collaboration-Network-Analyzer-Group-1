import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import toast from "react-hot-toast";
import { Search, Edit, Trash2, ArrowLeft, Building2, MapPin, Mail, Phone, Globe } from "lucide-react";
import Select from "react-select";
import "../css/institution.css";

const COUNTRIES = [
  "United States", "United Kingdom", "Canada", "Australia", "Germany", 
  "France", "Japan", "China", "India", "Brazil", "South Africa", "Other"
].map(c => ({ value: c, label: c }));

function Institution() {
  const navigate = useNavigate();
  const [institutions, setInstitutions] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [editId, setEditId] = useState(null);

  const initialFormState = {
    institution_name: "",
    institution_type: "University",
    address: "",
    city: "",
    state: "",
    country: "",
    website: "",
    email: "",
    phone: "",
    description: ""
  };

  const [formData, setFormData] = useState(initialFormState);

  useEffect(() => {
    fetchInstitutions();
  }, []);

  const fetchInstitutions = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await API.get("/institution", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setInstitutions(response.data);
    } catch (error) {
      console.log(error);
      toast.error("Failed to fetch institutions");
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validateForm = () => {
    if (!formData.institution_name.trim()) {
      toast.error("Institution Name is required");
      return false;
    }
    if (!formData.country.trim()) {
      toast.error("Country is required");
      return false;
    }
    if (!formData.email.trim()) {
      toast.error("Email is required");
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error("Invalid email format");
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
        await API.put(`/institution/${editId}`, formData, config);
        toast.success("Institution Updated Successfully");
      } else {
        await API.post("/institution", formData, config);
        toast.success("Institution Added Successfully");
      }

      setFormData(initialFormState);
      setEditId(null);
      fetchInstitutions();
    } catch (error) {
      console.log(error);
      if (error.response && error.response.data && error.response.data.detail) {
        toast.error(error.response.data.detail);
      } else {
        toast.error("Server Error");
      }
    }
  };

  const handleEdit = (inst) => {
    setEditId(inst.id);
    setFormData({
      institution_name: inst.institution_name || "",
      institution_type: inst.institution_type || "University",
      address: inst.address || "",
      city: inst.city || "",
      state: inst.state || "",
      country: inst.country || "",
      website: inst.website || "",
      email: inst.email || "",
      phone: inst.phone || "",
      description: inst.description || ""
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    try {
      const token = localStorage.getItem("token");
      await API.delete(`/institution/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success("Institution Deleted Successfully");
      fetchInstitutions();
    } catch (error) {
      console.log(error);
      if (error.response && error.response.data && error.response.data.detail) {
        toast.error(error.response.data.detail);
      } else {
        toast.error("Failed to delete institution");
      }
    }
  };

  const handleClear = () => {
    setFormData(initialFormState);
    setEditId(null);
  };

  const filteredInstitutions = institutions.filter(inst => 
    (inst.institution_name || "").toLowerCase().includes(searchQuery.toLowerCase()) || 
    (inst.country || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="institution-container">
      <button className="back-btn" onClick={() => navigate("/dashboard")}>
        <ArrowLeft size={18} /> Dashboard
      </button>

      <div className="institution-card form-card">
        <h2><Building2 size={28} color="#3182ce" /> Institution Management</h2>
        
        <form className="inst-form" onSubmit={handleSubmit}>
          <div className="form-group full-width">
            <label>Institution Name *</label>
            <input type="text" name="institution_name" value={formData.institution_name} onChange={handleChange} placeholder="Enter institution name" />
          </div>

          <div className="form-group">
            <label>Institution Type</label>
            <select name="institution_type" value={formData.institution_type} onChange={handleChange}>
              <option value="University">University</option>
              <option value="College">College</option>
              <option value="Research Lab">Research Lab</option>
              <option value="Company">Company</option>
              <option value="Government Organization">Government Organization</option>
            </select>
          </div>

          <div className="form-group">
            <label>Address</label>
            <input type="text" name="address" value={formData.address} onChange={handleChange} placeholder="Street address" />
          </div>

          <div className="form-group">
            <label>City</label>
            <input type="text" name="city" value={formData.city} onChange={handleChange} placeholder="City" />
          </div>

          <div className="form-group">
            <label>State/Province</label>
            <input type="text" name="state" value={formData.state} onChange={handleChange} placeholder="State" />
          </div>

          <div className="form-group" style={{marginBottom: "15px"}}>
            <label>Country *</label>
            <Select 
              options={COUNTRIES}
              value={COUNTRIES.find(c => c.value === formData.country) || (formData.country ? { value: formData.country, label: formData.country } : null)}
              onChange={(selected) => setFormData({ ...formData, country: selected.value })}
              placeholder="Select Country..."
              className="react-select-container"
              classNamePrefix="react-select"
            />
          </div>

          <div className="form-group">
            <label>Website</label>
            <input type="url" name="website" value={formData.website} onChange={handleChange} placeholder="https://example.edu" />
          </div>

          <div className="form-group">
            <label>Email *</label>
            <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="contact@example.edu" />
          </div>

          <div className="form-group">
            <label>Phone</label>
            <input type="text" name="phone" value={formData.phone} onChange={handleChange} placeholder="+1 234 567 8900" />
          </div>

          <div className="form-group full-width">
            <label>Description</label>
            <textarea name="description" value={formData.description} onChange={handleChange} placeholder="Brief description of the institution" rows="3"></textarea>
          </div>

          <div className="form-actions">
            <button type="submit" className="submit-btn">
              {editId ? "Update" : "Save"}
            </button>
            <button type="button" className="clear-btn" onClick={handleClear}>
              Clear
            </button>
          </div>
        </form>
      </div>

      <div className="institution-card list-card">
        <div className="controls-container">
          <h3>My Institutions</h3>
          <div className="search-bar">
            <Search size={20} />
            <input 
              type="text" 
              placeholder="Search institutions..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="inst-grid">
          {filteredInstitutions.map(inst => (
            <div className="inst-item-card" key={inst.id}>
              <div className="inst-header">
                <h4>{inst.institution_name}</h4>
                <div className="action-btns">
                  <button className="edit-btn" onClick={() => handleEdit(inst)} title="Edit"><Edit size={16} /></button>
                  <button className="delete-btn" onClick={() => handleDelete(inst.id)} title="Delete"><Trash2 size={16} /></button>
                </div>
              </div>
              
              <div className="inst-details">
                <p><MapPin size={14} /> {[inst.city, inst.state, inst.country].filter(Boolean).join(", ")}</p>
                <p><Mail size={14} /> {inst.email || "N/A"}</p>
                <p><Phone size={14} /> {inst.phone || "N/A"}</p>
                {inst.website && <p><Globe size={14} /> <a href={inst.website} target="_blank" rel="noreferrer">{inst.website}</a></p>}
              </div>
            </div>
          ))}
          {filteredInstitutions.length === 0 && (
            <div className="empty-state">
              <p>No institutions found.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Institution;
