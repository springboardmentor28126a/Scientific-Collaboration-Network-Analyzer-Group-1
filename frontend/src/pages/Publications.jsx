import axios from "axios";
import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import api from "../services/api";
import "../styles/dashboard.css";

function Publications() {
 const [papers, setPapers] = useState([]);

const [showForm, setShowForm] = useState(false);

const [search, setSearch] = useState("");

const [editingId, setEditingId] = useState(null);

const [formData, setFormData] = useState({
  title: "",
  abstract: "",
  authors: "",
  keywords: "",
  publication_year: "",
  journal: "",
  publication_type: "",
  publication_status: "",
  pdf_file: "",
});
const [selectedFile, setSelectedFile] = useState(null);

  const fetchPapers = async () => {
    try {
      const response = await api.get("/papers/");
      setPapers(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchPapers();
  }, []);

  const addPaper = async () => {
    try {
      let pdfPath = "";

if (selectedFile) {

  const data = new FormData();

  data.append("file", selectedFile);

  const uploadResponse = await axios.post(
    "http://127.0.0.1:8000/papers/upload",
    data,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );
console.log("Upload Response:", uploadResponse.data);
  pdfPath = uploadResponse.data.file_path;
}
      await api.post("/papers/", {
  ...formData,
  pdf_file: pdfPath,
  publication_year: Number(formData.publication_year),
});

      alert("Publication Added Successfully");
      setShowForm(false);
      
      // Form fields reset karne ke liye
      setFormData({
  title: "",
  abstract: "",
  authors: "",
  keywords: "",
  publication_year: "",
  journal: "",
  publication_type: "",
  publication_status: "",
  pdf_file: "",
});

      fetchPapers();
    } catch (error) {
  console.log("Error:", error);
  console.log("Response:", error.response);
  console.log("Data:", error.response?.data);
}
  };

  const deletePaper = async (id) => {
    if (!window.confirm("Delete this publication?")) return;

    try {
      // Yahan backticks (``) fix kar diye hain variable interpolation ke liye
      await api.delete(`/papers/${id}`);
      alert("Publication Deleted");
      fetchPapers();
    } catch (error) {
      console.error(error);
    }
  };
  const updatePaper = async () => {
  try {

    let pdfPath = formData.pdf_file;

    // Agar user ne nayi PDF select ki hai
    if (selectedFile) {

      const data = new FormData();
      data.append("file", selectedFile);

      const uploadResponse = await axios.post(
        "http://127.0.0.1:8000/papers/upload",
        data,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      pdfPath = uploadResponse.data.file_path;
    }

    await api.put(`/papers/${editingId}`, {
      ...formData,
      pdf_file: pdfPath,
      publication_year: Number(formData.publication_year),
    });

    alert("Publication Updated Successfully");

    setShowForm(false);
    setEditingId(null);
    setSelectedFile(null);

    fetchPapers();

  } catch (error) {
    console.error(error);
  }
};

  return (
    <>
      <Navbar />

      <div style={{ display: "flex" }}>
        <Sidebar />

        <div className="main">
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "20px",
            }}
          >
            <h1>Publications</h1>

            <button
              onClick={() => setShowForm(true)}
              style={{
                background: "#2563eb",
                color: "white",
                border: "none",
                padding: "12px 18px",
                borderRadius: "8px",
                cursor: "pointer",
              }}
            >
              + Add Publication
            </button>
          </div>

          {showForm && (
            <div
              style={{
                background: "white",
                padding: "20px",
                borderRadius: "10px",
                marginBottom: "20px",
                boxShadow: "0 5px 15px rgba(0,0,0,0.1)",
              }}
            >
              <h2>Add Publication</h2>

              <input
                placeholder="Title"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
              />
              <br /><br />

              <textarea
                placeholder="Abstract"
                value={formData.abstract}
                onChange={(e) =>
                  setFormData({ ...formData, abstract: e.target.value })
                }
              />
              <br /><br />

              <input
                placeholder="Authors"
                value={formData.authors}
                onChange={(e) =>
                  setFormData({ ...formData, authors: e.target.value })
                }
              />
              <br /><br />

              <input
                placeholder="Keywords"
                value={formData.keywords}
                onChange={(e) =>
                  setFormData({ ...formData, keywords: e.target.value })
                }
              />
              <br /><br />

              <input
                type="number"
                placeholder="Publication Year"
                value={formData.publication_year}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    publication_year: e.target.value,
                  })
                }
              />
              <br /><br />

              <input
                placeholder="Journal"
                value={formData.journal}
                onChange={(e) =>
                  setFormData({ ...formData, journal: e.target.value })
                }
              />
              <br /><br />
              <select
  value={formData.publication_type}
  onChange={(e) =>
    setFormData({
      ...formData,
      publication_type: e.target.value,
    })
  }
>
  <option value="">Select Publication Type</option>
  <option value="Journal Paper">Journal Paper</option>
  <option value="Conference Paper">Conference Paper</option>
  <option value="Book">Book</option>
  <option value="Patent">Patent</option>
  <option value="Technical Report">Technical Report</option>
</select>

<br /><br />

<label>Publication Status</label>

<select
  value={formData.publication_status}
  onChange={(e) =>
    setFormData({
      ...formData,
      publication_status: e.target.value,
    })
  }
>
  <option value="Draft">Draft</option>
  <option value="Published">Published</option>
  <option value="Rejected">Rejected</option>
</select>

<br /><br />

<label>Select PDF</label>

<br />

<input
  type="file"
  accept=".pdf"
  onChange={(e) => setSelectedFile(e.target.files[0])}
/>

<br /><br />
              <button
  onClick={
    editingId
      ? updatePaper
      : addPaper
  }
>
  {editingId ? "Update" : "Save"}
</button>
            </div>
          )}

          <input
  type="text"
  placeholder="Search Publication..."
  value={search}
  onChange={(e) => setSearch(e.target.value)}
  style={{
    width: "100%",
    padding: "12px",
    marginBottom: "20px",
    borderRadius: "8px",
    border: "1px solid #ccc",
  }}
/>

          <div className="tableBox">
            <table>
             <thead>
<tr>
  <th>Title</th>
  <th>Type</th>
  <th>Status</th>
  <th>Authors</th>
  <th>Year</th>
  <th>Journal</th>
  <th>PDF</th>
  <th>Actions</th>
</tr>
</thead>

              <tbody>
  {papers
    .filter((paper) =>
      paper.title
        .toLowerCase()
        .includes(search.toLowerCase())
    )
    .map((paper) => (
                  <tr key={paper.id}>
  <td>{paper.title}</td>
  <td>{paper.publication_type}</td>
  <td>{paper.publication_status}</td>
  <td>{paper.authors}</td>
  <td>{paper.publication_year}</td>
  <td>{paper.journal}</td>
  <td>
  {paper.pdf_file && (
    <a
      href={`http://127.0.0.1:8000/${paper.pdf_file}`}
      target="_blank"
      rel="noreferrer"
    >
      View PDF
    </a>
  )}
</td>
  <td>  <button
    onClick={() => {
      setEditingId(paper.id);

      setFormData({
        title: paper.title,
        abstract: paper.abstract,
        authors: paper.authors,
        keywords: paper.keywords,
        publication_year: paper.publication_year,
        journal: paper.journal,
        publication_type: paper.publication_type,
        publication_status: paper.publication_status,
        pdf_file: paper.pdf_file,
      });

      setShowForm(true);
    }}
    style={{
      background: "#2563eb",
      color: "white",
      border: "none",
      padding: "8px 14px",
      borderRadius: "6px",
      cursor: "pointer",
      marginRight: "10px",
    }}
  >
    Edit
  </button>
                        
                      <button
                        onClick={() => deletePaper(paper.id)}
                        style={{
                          background: "#dc2626",
                          color: "white",
                          border: "none",
                          padding: "8px 12px",
                          borderRadius: "6px",
                          cursor: "pointer",
                        }}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}

export default Publications;