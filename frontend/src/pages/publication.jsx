import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import toast from "react-hot-toast";
import { Search, Edit, Trash2, ArrowLeft, UploadCloud, BookOpen } from "lucide-react";
import "../css/publication.css";

function Publication() {
  const navigate = useNavigate();
  const [publications, setPublications] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortKey, setSortKey] = useState("year"); // "year" or "title"
  const [filterStatus, setFilterStatus] = useState("");
  const [filterType, setFilterType] = useState("");
  const [editId, setEditId] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);

  const [formData, setFormData] = useState({
    title: "",
    abstract: "",
    keywords: "",
    authors: "",
    journal: "",
    conference: "",
    publication_year: "",
    doi: "",
    publication_type: "Journal Paper",
    publication_status: "Published"
  });

  useEffect(() => {
    fetchPublications();
  }, []);

  const fetchPublications = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await API.get("/publication", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPublications(response.data);
    } catch (error) {
      console.log(error);
      toast.error("Failed to fetch publications");
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validateForm = () => {
    if (!formData.title || !formData.authors || !formData.publication_year) {
      toast.error("Title, Authors, and Year are required");
      return false;
    }
    if (isNaN(formData.publication_year)) {
      toast.error("Publication Year must be numeric");
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
      
      const payload = {
        ...formData,
        publication_year: parseInt(formData.publication_year)
      };

      const response = editId 
        ? await API.put(`/publication/${editId}`, payload, config)
        : await API.post("/publication", payload, config);

      const pubId = editId ? editId : response.data.id;

      if (selectedFile) {
        const fileData = new FormData();
        fileData.append("file", selectedFile);
        try {
          await API.post(`/publication/${pubId}/upload`, fileData, {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "multipart/form-data"
            }
          });
          toast.success("Publication Uploaded");
        } catch (uploadError) {
          toast.error("Failed to upload PDF");
        }
      } else {
        toast.success(editId ? "Publication Updated Successfully" : "Publication Added Successfully");
      }
      
      setFormData({
        title: "", abstract: "", keywords: "", authors: "",
        journal: "", conference: "", publication_year: "", doi: "",
        publication_type: "Journal Paper", publication_status: "Published"
      });
      setSelectedFile(null);
      setEditId(null);
      fetchPublications();
    } catch (error) {
      console.log(error);
      if (error.response?.data?.detail === "DOI already exists") {
        toast.error("DOI cannot be duplicated");
      } else {
        toast.error("Server Error");
      }
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.type !== "application/pdf") {
        toast.error("Only PDF files are allowed");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File size should not exceed 5MB");
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleEdit = (pub) => {
    setEditId(pub.id);
    setFormData({
      title: pub.title || "",
      abstract: pub.abstract || "",
      keywords: pub.keywords || "",
      authors: pub.authors || "",
      journal: pub.journal || "",
      conference: pub.conference || "",
      publication_year: pub.publication_year ? pub.publication_year.toString() : "",
      doi: pub.doi || "",
      publication_type: pub.publication_type || "Journal Paper",
      publication_status: pub.publication_status || "Published"
    });
    setSelectedFile(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    try {
      const token = localStorage.getItem("token");
      await API.delete(`/publication/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success("Publication Deleted");
      fetchPublications();
    } catch (error) {
      console.log(error);
      toast.error("Failed to delete publication");
    }
  };

  const filteredPublications = publications
    .filter(pub => 
      (pub.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
       pub.authors.toLowerCase().includes(searchQuery.toLowerCase())) &&
      (filterStatus ? pub.publication_status === filterStatus : true) &&
      (filterType ? pub.publication_type === filterType : true)
    )
    .sort((a, b) => {
      if (sortKey === "year") {
        return b.publication_year - a.publication_year;
      }
      return a.title.localeCompare(b.title);
    });

  return (
    <div className="publication-container">
      <button className="back-btn" onClick={() => navigate("/dashboard")}>
        <ArrowLeft size={18} /> Dashboard
      </button>

      <div className="publication-card">
        <h2><BookOpen size={28} color="#3182ce" /> Publication Management</h2>
        
        <form className="pub-form" onSubmit={handleSubmit}>
          <div className="form-group full-width">
            <label>Publication Title *</label>
            <input type="text" name="title" value={formData.title} onChange={handleChange} placeholder="Enter title" required />
          </div>

          <div className="form-group full-width">
            <label>Abstract</label>
            <textarea name="abstract" value={formData.abstract} onChange={handleChange} placeholder="Enter abstract"></textarea>
          </div>

          <div className="form-group full-width">
            <label>Authors *</label>
            <input type="text" name="authors" value={formData.authors} onChange={handleChange} placeholder="John Doe, Jane Smith" required />
          </div>

          <div className="form-group">
            <label>Keywords</label>
            <input type="text" name="keywords" value={formData.keywords} onChange={handleChange} placeholder="AI, Machine Learning" />
          </div>

          <div className="form-group">
            <label>Journal</label>
            <input type="text" name="journal" value={formData.journal} onChange={handleChange} placeholder="Nature, Science" />
          </div>

          <div className="form-group">
            <label>Conference</label>
            <input type="text" name="conference" value={formData.conference} onChange={handleChange} placeholder="NeurIPS, CVPR" />
          </div>

          <div className="form-group">
            <label>Publication Year *</label>
            <input type="number" name="publication_year" value={formData.publication_year} onChange={handleChange} placeholder="2023" required />
          </div>

          <div className="form-group">
            <label>DOI</label>
            <input type="text" name="doi" value={formData.doi} onChange={handleChange} placeholder="10.1000/xyz123" />
          </div>

          <div className="form-group">
            <label>Publication Type</label>
            <select name="publication_type" value={formData.publication_type} onChange={handleChange}>
              <option value="Journal Paper">Journal Paper</option>
              <option value="Conference Paper">Conference Paper</option>
              <option value="Book">Book</option>
              <option value="Patent">Patent</option>
              <option value="Technical Report">Technical Report</option>
            </select>
          </div>

          <div className="form-group">
            <label>Publication Status</label>
            <select name="publication_status" value={formData.publication_status} onChange={handleChange}>
              <option value="Draft">Draft</option>
              <option value="Submitted">Submitted</option>
              <option value="Published">Published</option>
              <option value="Archived">Archived</option>
            </select>
          </div>

          <div className="form-group full-width">
            <label>PDF Upload</label>
            <input type="file" accept="application/pdf" onChange={handleFileChange} style={{display: 'none'}} id="pdf-upload" />
            <button type="button" className="upload-btn" onClick={() => document.getElementById("pdf-upload").click()}>
              <UploadCloud size={20} /> {selectedFile ? selectedFile.name : "Choose File"}
            </button>
          </div>

          <button type="submit" className="submit-btn">
            {editId ? "Update Publication" : "Submit Publication"}
          </button>
        </form>
      </div>

      <div className="publication-card">
        <div className="controls-container">
          <div className="search-bar">
            <Search size={20} />
            <input 
              type="text" 
              placeholder="Search publications..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <select value={filterType} onChange={(e) => setFilterType(e.target.value)} className="filter-select">
              <option value="">All Types</option>
              <option value="Journal Paper">Journal Paper</option>
              <option value="Conference Paper">Conference Paper</option>
              <option value="Book">Book</option>
              <option value="Patent">Patent</option>
              <option value="Technical Report">Technical Report</option>
            </select>
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="filter-select">
              <option value="">All Statuses</option>
              <option value="Draft">Draft</option>
              <option value="Submitted">Submitted</option>
              <option value="Published">Published</option>
              <option value="Archived">Archived</option>
            </select>
          </div>
          <div className="sort-controls">
            <button className={`sort-btn ${sortKey === 'year' ? 'active' : ''}`} onClick={() => setSortKey('year')}>
              Sort by Year
            </button>
            <button className={`sort-btn ${sortKey === 'title' ? 'active' : ''}`} onClick={() => setSortKey('title')}>
              Sort by Title
            </button>
          </div>
        </div>

        <div className="table-responsive">
          <table className="pub-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Authors</th>
                <th>Journal/Conf</th>
                <th>Year</th>
                <th>Type</th>
                <th>Status</th>
                <th>DOI</th>
                <th>File</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPublications.map(pub => (
                <tr key={pub.id}>
                  <td>{pub.title}</td>
                  <td>{pub.authors}</td>
                  <td>{pub.journal || pub.conference || "N/A"}</td>
                  <td>{pub.publication_year}</td>
                  <td>{pub.publication_type}</td>
                  <td>{pub.publication_status}</td>
                  <td>{pub.doi || "N/A"}</td>
                  <td>
                    {pub.file_path ? (
                      <span className="file-indicator" title={pub.file_path}>📄</span>
                    ) : (
                      "N/A"
                    )}
                  </td>
                  <td>
                    <div className="action-btns">
                      <button className="edit-btn" onClick={() => handleEdit(pub)} title="Edit">
                        <Edit size={16} />
                      </button>
                      <button className="delete-btn" onClick={() => handleDelete(pub.id)} title="Delete">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredPublications.length === 0 && (
                <tr>
                  <td colSpan="6" style={{ textAlign: "center", padding: "2rem" }}>No publications found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Publication;
