import { useEffect, useState } from "react";
import api from "../services/api";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import "../styles/dashboard.css";

function Conferences() {
  const [conferences, setConferences] = useState([]);
const [showForm, setShowForm] = useState(false);
const [search, setSearch] = useState("");
const [editingId, setEditingId] = useState(null);

const [formData, setFormData] = useState({
  conference_name: "",
  organizer: "",
  location: "",
  conference_date: "",
  conference_type: "",
  presentation_title: "",
  participation_role: "",
  event_schedule: "",
  status: "",
  remarks: "",
});
const fetchConferences = async () => {
  try {
    const response = await api.get("/conferences/");

    console.log("API Response:", response.data);

    setConferences(response.data);
  } catch (error) {
    console.error(error);
  }
};
const addConference = async () => {
  try {
    console.log("Save button clicked");
    console.log(formData);

    const response = await api.post("/conferences/", {
      ...formData,
    });

    console.log(response.data);

    alert("Conference Added Successfully");

    setShowForm(false);

    setFormData({
      conference_name: "",
      organizer: "",
      location: "",
      conference_date: "",
      conference_type: "",
      presentation_title: "",
      participation_role: "",
      event_schedule: "",
      status: "",
      remarks: "",
    });

    fetchConferences();
  } catch (error) {
    console.error("API Error:", error);
    console.log(error.response);
    console.log(error.response?.data);
    alert("Error while saving conference");
  }
};
const editConference = (conference) => {
  setEditingId(conference.id);

  setFormData({
    conference_name: conference.conference_name,
    organizer: conference.organizer,
    location: conference.location,
    conference_date: conference.conference_date,
    conference_type: conference.conference_type,
    presentation_title: conference.presentation_title,
    participation_role: conference.participation_role,
    event_schedule: conference.event_schedule
      ? conference.event_schedule.slice(0, 16)
      : "",
    status: conference.status,
    remarks: conference.remarks,
  });
  setShowForm(true);
};
const updateConference = async () => {
  try {
    await api.put(`/conferences/${editingId}`, {
      ...formData,
    });

    alert("Conference Updated Successfully");

    setShowForm(false);
    setEditingId(null);

    setFormData({
      conference_name: "",
      organizer: "",
      location: "",
      conference_date: "",
      conference_type: "",
      presentation_title: "",
      participation_role: "",
      event_schedule: "",
      status: "",
      remarks: "",
    });

    fetchConferences();
  } catch (error) {
    console.error(error);
  }
};
const deleteConference = async (id) => {
  const confirmDelete = window.confirm(
    "Are you sure you want to delete this conference?"
  );

  if (!confirmDelete) return;

  try {
    await api.delete(`/conferences/${id}`);

    alert("Conference Deleted Successfully");

    fetchConferences();
  } catch (error) {
    console.error(error);
  }
};

useEffect(() => {
  fetchConferences();
}, []);
const filteredConferences = conferences.filter((conference) =>
  conference.conference_name
    .toLowerCase()
    .includes(search.toLowerCase())
);
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
            <h1>Conferences</h1>

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
              + Add Conference
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
    <h2>Add Conference</h2>

    <input
      type="text"
      placeholder="Conference Name"
      value={formData.conference_name}
      onChange={(e) =>
        setFormData({
          ...formData,
          conference_name: e.target.value,
        })
      }
    />

    <br /><br />

    <input
      type="text"
      placeholder="Organizer"
      value={formData.organizer}
      onChange={(e) =>
        setFormData({
          ...formData,
          organizer: e.target.value,
        })
      }
    />

    <br /><br />

    <input
      type="text"
      placeholder="Location"
      value={formData.location}
      onChange={(e) =>
        setFormData({
          ...formData,
          location: e.target.value,
        })
      }
    />

    <br /><br />
    <input
  type="date"
  value={formData.conference_date}
  onChange={(e) =>
    setFormData({
      ...formData,
      conference_date: e.target.value,
    })
  }
/>

<br /><br />
<select
  value={formData.conference_type}
  onChange={(e) =>
    setFormData({
      ...formData,
      conference_type: e.target.value,
    })
  }
>
  <option value="">Select Conference Type</option>
  <option value="National">National</option>
  <option value="International">International</option>
  <option value="Workshop">Workshop</option>
  <option value="Seminar">Seminar</option>
</select>

<br /><br />
<input
  type="text"
  placeholder="Presentation Title"
  value={formData.presentation_title}
  onChange={(e) =>
    setFormData({
      ...formData,
      presentation_title: e.target.value,
    })
  }
/>

<br /><br />
<select
  value={formData.participation_role}
  onChange={(e) =>
    setFormData({
      ...formData,
      participation_role: e.target.value,
    })
  }
>
  <option value="">Select Role</option>
  <option value="Presenter">Presenter</option>
  <option value="Attendee">Attendee</option>
  <option value="Organizer">Organizer</option>
  <option value="Reviewer">Reviewer</option>
</select>

<br /><br />
<input
  type="datetime-local"
  value={formData.event_schedule}
  onChange={(e) =>
    setFormData({
      ...formData,
      event_schedule: e.target.value,
    })
  }
/>

<br /><br />
<select
  value={formData.status}
  onChange={(e) =>
    setFormData({
      ...formData,
      status: e.target.value,
    })
  }
>
  <option value="">Select Status</option>
  <option value="Upcoming">Upcoming</option>
  <option value="Completed">Completed</option>
  <option value="Cancelled">Cancelled</option>
</select>

<br /><br />
<textarea
  placeholder="Remarks"
  value={formData.remarks}
  onChange={(e) =>
    setFormData({
      ...formData,
      remarks: e.target.value,
    })
  }
/>

<br /><br />
<button
  onClick={editingId ? updateConference : addConference}
  style={{
    background: "#2563eb",
    color: "white",
    border: "none",
    padding: "10px 18px",
    borderRadius: "8px",
    cursor: "pointer",
  }}
>
  {editingId ? "Update Conference" : "Save Conference"}
</button>
  </div>
)}
          <input
            type="text"
            placeholder="Search Conference..."
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
                  <th>Conference</th>
                  <th>Location</th>
                  <th>Year</th>
                  <th>Organizer</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
               {filteredConferences.map((conference) => (
  <tr key={conference.id}>
    <td>{conference.conference_name}</td>
    <td>{conference.location}</td>
    <td>
      {conference.conference_date
        ? new Date(conference.conference_date).getFullYear()
        : ""}
    </td>
    <td>{conference.organizer}</td>
    <td>
  <button
  onClick={() => editConference(conference)}
>
  Edit
</button>

  <button
  onClick={() => deleteConference(conference.id)}
  style={{
    marginLeft: "10px",
    background: "#dc2626",
    color: "white",
    border: "none",
    padding: "5px 10px",
    borderRadius: "5px",
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

export default Conferences;