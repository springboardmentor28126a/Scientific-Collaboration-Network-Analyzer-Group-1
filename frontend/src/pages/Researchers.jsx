import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import api from "../services/api";
import "../styles/dashboard.css";


function Researchers() {
  const [researchers, setResearchers] = useState([]);

  const [showForm, setShowForm] = useState(false);
 const [search, setSearch] = useState("");
 const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
  name: "",
  email: "",
  university: "",
  department: "",
  designation: "",
  experience: "",
  phone: "",
  research_interests: "",
  skills: "",
  bio: "",
});

  // fetchResearchers...
  const fetchResearchers = async () => {
  try {
    const response = await api.get("/researchers/");
    setResearchers(response.data);
  } catch (error) {
    console.error("Error fetching researchers:", error);
  }
};

useEffect(() => {
  fetchResearchers();
}, []);
const addResearcher = async () => {
  try {
    await api.post("/researchers/", formData);

    alert("Researcher Added Successfully");

    setShowForm(false);

    fetchResearchers();

  } catch (error) {
    console.error(error);
  }
};
const deleteResearcher = async (id) => {
  const confirmDelete = window.confirm(
    "Are you sure you want to delete this researcher?"
  );

  if (!confirmDelete) return;

  try {
    await api.delete(`/researchers/${id}`);

    alert("Researcher Deleted Successfully");

    fetchResearchers();

  } catch (error) {
    console.error(error);
  }
};
const updateResearcher = async () => {
  try {
    await api.put(`/researchers/${editingId}`, formData);

    alert("Researcher Updated Successfully");

    setShowForm(false);
    setEditingId(null);

    fetchResearchers();

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
            <h1>Researchers</h1>

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
  + Add Researcher
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
    <h2>{editingId ? "Update Researcher" : "Add Researcher"}</h2>

    <input
      placeholder="Name"
      value={formData.name}
      onChange={(e) =>
        setFormData({ ...formData, name: e.target.value })
      }
    />

    <br /><br />

    <input
      placeholder="Email"
      value={formData.email}
      onChange={(e) =>
        setFormData({ ...formData, email: e.target.value })
      }
    />

    <br /><br />

    <input
      placeholder="University"
      value={formData.university}
      onChange={(e) =>
        setFormData({ ...formData, university: e.target.value })
      }
    />

    <br /><br />

    <input
      placeholder="Department"
      value={formData.department}
      onChange={(e) =>
        setFormData({ ...formData, department: e.target.value })
      }
    />

    <br /><br />
    <input
  placeholder="Designation"
  value={formData.designation}
  onChange={(e) =>
    setFormData({
      ...formData,
      designation: e.target.value,
    })
  }
/>

<br /><br />

<input
  type="number"
  placeholder="Experience (Years)"
  value={formData.experience}
  onChange={(e) =>
    setFormData({
      ...formData,
      experience: e.target.value,
    })
  }
/>

<br /><br />

<input
  placeholder="Phone Number"
  value={formData.phone}
  onChange={(e) =>
    setFormData({
      ...formData,
      phone: e.target.value,
    })
  }
/>

<br /><br />

    <input
      placeholder="Research Interests"
      value={formData.research_interests}
      onChange={(e) =>
        setFormData({
          ...formData,
          research_interests: e.target.value,
        })
      }
    />

    <br /><br />

    <input
      placeholder="Skills"
      value={formData.skills}
      onChange={(e) =>
        setFormData({ ...formData, skills: e.target.value })
      }
    />

    <br /><br />

    <textarea
      placeholder="Bio"
      value={formData.bio}
      onChange={(e) =>
        setFormData({ ...formData, bio: e.target.value })
      }
    />

    <br /><br />

    <button
  onClick={
    editingId
      ? updateResearcher
      : addResearcher
  }
>
  {editingId ? "Update" : "Save"}
</button>
  </div>
)}
<input
  type="text"
  placeholder="Search Researcher..."
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
    <th>Name</th>
    <th>Institution</th>
    <th>Department</th>
    <th>Designation</th>
    <th>Experience</th>
    <th>Phone</th>
    <th>Email</th>
    <th>Actions</th>
  </tr>
</thead> 
 <tbody>
  {researchers
    .filter((researcher) =>
  researcher.name.toLowerCase().includes(search.toLowerCase()) ||
  researcher.department.toLowerCase().includes(search.toLowerCase()) ||
  researcher.designation.toLowerCase().includes(search.toLowerCase())
)
    .map((researcher) => (
    <tr key={researcher.id}>
  <td>{researcher.name}</td>
  <td>{researcher.university}</td>
  <td>{researcher.department}</td>
  <td>{researcher.designation}</td>
  <td>{researcher.experience} Years</td>
  <td>{researcher.phone}</td>
  <td>{researcher.email}</td>

  <td>
        <button
  onClick={() => {
    setEditingId(researcher.id);

    setFormData({
  name: researcher.name,
  email: researcher.email,
  university: researcher.university,
  department: researcher.department,
  designation: researcher.designation,
  experience: researcher.experience,
  phone: researcher.phone,
  research_interests: researcher.research_interests,
  skills: researcher.skills,
  bio: researcher.bio,
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
          onClick={() => deleteResearcher(researcher.id)}
          style={{
            background: "#dc2626",
            color: "white",
            border: "none",
            padding: "8px 14px",
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

export default Researchers;