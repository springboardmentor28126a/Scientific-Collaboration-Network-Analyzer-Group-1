import { useState, useEffect } from "react";
import api from "../services/api";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import "../styles/dashboard.css";

function Institutions() {
  const [institutions, setInstitutions] = useState([]);
const [search, setSearch] = useState("");

const [showForm, setShowForm] = useState(false);
const [editingId, setEditingId] = useState(null);
const [isEditing, setIsEditing] = useState(false);
const [formData, setFormData] = useState({
  institution_name: "",
  institution_type: "",
  country: "",
  state: "",
  city: "",
  address: "",
  website: "",
  email: "",
  contact_number: "",
  status: "Active",
});
const fetchInstitutions = async () => {
  try {
    const response = await api.get("/institutions/");
    console.log(response.data); 
    setInstitutions(response.data);
  } catch (error) {
    console.error(error);
  }
};
const addInstitution = async () => {
  try {
    await api.post("/institutions/", formData);

    alert("Institution Added Successfully");

    fetchInstitutions();

    setShowForm(false);

    setFormData({
      institution_name: "",
      institution_type: "",
      country: "",
      state: "",
      city: "",
      address: "",
      website: "",
      email: "",
      contact_number: "",
      status: "Active",
    });
    } catch (error) {
    console.error(error);
  }
};
  const editInstitution = (institution) => {
  setEditingId(institution.id);
  setIsEditing(true);
  setShowForm(true);

  setFormData({
    institution_name: institution.institution_name,
    institution_type: institution.institution_type,
    country: institution.country,
    state: institution.state,
    city: institution.city,
    address: institution.address,
    website: institution.website,
    email: institution.email,
    contact_number: institution.contact_number,
    status: institution.status,
  });
};
const updateInstitution = async () => {
  try {

    await api.put(`/institutions/${editingId}`, formData);

    alert("Institution Updated Successfully");

    fetchInstitutions();

    setShowForm(false);
    setIsEditing(false);
    setEditingId(null);

  } catch (error) {
    console.error(error);
  }
};
const deleteInstitution = async (id) => {

  if (!window.confirm("Delete this institution?")) return;

  try {

    await api.delete(`/institutions/${id}`);

    alert("Institution Deleted Successfully");

    fetchInstitutions();

  } catch (error) {
    console.error(error);
  }

};
useEffect(() => {
  fetchInstitutions();
}, []);
const filteredInstitutions = institutions.filter((institution) =>
  institution.institution_name
    .toLowerCase()
    .includes(search.toLowerCase())
);
  return (
  <div style={{ display: "flex", minHeight: "100vh" }}>
    <Sidebar />

    <div style={{ flex: 1 }}>
      <Navbar />

      <div className="main">

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "20px",
            }}
          >
            <h1>Institutions</h1>

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
  + Add Institution
</button>
          </div>

          <input
  type="text"
  placeholder="Search Institution..."
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
{showForm && (
  <div
    style={{
      background: "#fff",
      padding: "20px",
      borderRadius: "10px",
      marginBottom: "20px",
      boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
    }}
  >
    <h2>Add Institution</h2>

    <input
      type="text"
      placeholder="Institution Name"
      value={formData.institution_name}
      onChange={(e) =>
        setFormData({
          ...formData,
          institution_name: e.target.value,
        })
      }
    />

    <br /><br />

    <input
      type="text"
      placeholder="Institution Type"
      value={formData.institution_type}
      onChange={(e) =>
        setFormData({
          ...formData,
          institution_type: e.target.value,
        })
      }
    />

    <br /><br />

    <input
      type="text"
      placeholder="Country"
      value={formData.country}
      onChange={(e) =>
        setFormData({
          ...formData,
          country: e.target.value,
        })
      }
    />

    <br /><br />

    <button
  onClick={isEditing ? updateInstitution : addInstitution}
  style={{
    background: "#2563eb",
    color: "white",
    border: "none",
    padding: "10px 18px",
    borderRadius: "6px",
    cursor: "pointer",
  }}
>
  {isEditing ? "Update Institution" : "Save Institution"}
</button>

    <button
      onClick={() => setShowForm(false)}
      style={{ marginLeft: "10px" }}
    >
      Cancel
    </button>
  </div>
)}

          <div className="tableBox">
            <table>
              <thead>
                <tr>
                  <th>Institution</th>
                  <th>Country</th>
                  <th>Institution Type</th>
                  <th>Website</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
  {filteredInstitutions.map((institution) => (
    <tr key={institution.id}>
      <td>{institution.institution_name}</td>
      <td>{institution.country}</td>
      <td>{institution.institution_type}</td>
      <td>
  <a
    href={institution.website}
    target="_blank"
    rel="noreferrer"
  >
    {institution.website}
  </a>
</td>
<td>
  <button
  onClick={() => editInstitution(institution)}
  style={{
    background: "#2563eb",
    color: "white",
    border: "none",
    padding: "5px 10px",
    cursor: "pointer",
    borderRadius: "5px",
  }}
>
  Edit
</button>

  <button
  onClick={() => deleteInstitution(institution.id)}
  style={{
    marginLeft: "10px",
    background: "red",
    color: "white",
    border: "none",
    padding: "5px 10px",
    cursor: "pointer",
    borderRadius: "5px",
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
    </div>
  );
}

export default Institutions;