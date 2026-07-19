import { useEffect, useState } from "react";
import API from "../api";
import { Link } from "react-router-dom";

function Conference() {

  const [conferences, setConferences] = useState([]);

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

  return (
    <div style={{ textAlign: "center", marginTop: "40px" }}>

      <h1>Conferences</h1>

      <Link to="/addconference">
        <button
          style={{
            padding: "10px 20px",
            marginBottom: "20px",
            cursor: "pointer"
          }}
        >
          Add Conference
        </button>
      </Link>

      <table
        border="1"
        style={{
          width: "90%",
          margin: "auto",
          borderCollapse: "collapse"
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
          {conferences.map((conference) => (
            <tr key={conference.id}>
              <td>{conference.id}</td>
              <td>{conference.name}</td>
              <td>{conference.location}</td>
              <td>{conference.date}</td>
              <td>{conference.organizer}</td>

              <td>
                <Link to={`/editconference/${conference.id}`}>
                  <button
                    style={{
                      marginRight: "10px",
                      cursor: "pointer"
                    }}
                  >
                    Edit
                  </button>
                </Link>

                <button
                  onClick={() => deleteConference(conference.id)}
                  style={{
                    cursor: "pointer"
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
  );
}

export default Conference;