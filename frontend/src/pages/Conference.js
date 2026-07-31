import { useEffect, useState } from "react";
import API from "../api";
import { Link } from "react-router-dom";

function Conference() {
  const [conferences, setConferences] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchConferences();
  }, []);

  const fetchConferences = async () => {
    try {
      const response = await API.get("/conference");
      setConferences(response.data);
    } catch (error) {
      console.log("Failed to load conferences", error);
    }
  };

  const deleteConference = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this conference?"
    );

    if (!confirmDelete) return;

    try {
      await API.delete(`/conference/${id}`);

      alert("Conference deleted successfully.");

      fetchConferences();
    } catch (error) {
      console.log(error);
      alert("Failed to delete conference.");
    }
  };

  // Search Filter
  const filteredConferences = conferences.filter((conference) =>
    conference.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ width: "90%", margin: "40px auto" }}>
      <h1 style={{ textAlign: "center" }}>Conferences</h1>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: "20px",
        }}
      >
        <input
          type="text"
          placeholder="Search Conference..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            width: "300px",
            padding: "8px",
          }}
        />

        <Link to="/add-conference">
          <button
            style={{
              padding: "10px 20px",
              cursor: "pointer",
            }}
          >
            Add Conference
          </button>
        </Link>
      </div>

      <table
        border="1"
        style={{
          width: "100%",
          borderCollapse: "collapse",
        }}
      >
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Location</th>
            <th>Date</th>
            <th>Organizer</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {filteredConferences.length > 0 ? (
            filteredConferences.map((conference) => (
              <tr key={conference.id}>
                <td>{conference.id}</td>
                <td>{conference.name}</td>
                <td>{conference.location}</td>
                <td>{conference.date}</td>
                <td>{conference.organizer}</td>

                <td>
                  <Link to={`/edit-conference/${conference.id}`}>
                    <button
                      style={{
                        marginRight: "10px",
                        cursor: "pointer",
                      }}
                    >
                      Edit
                    </button>
                  </Link>

                  <button
                    onClick={() => deleteConference(conference.id)}
                    style={{
                      cursor: "pointer",
                    }}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="6" style={{ textAlign: "center", padding: "15px" }}>
                No Conferences Found
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default Conference;