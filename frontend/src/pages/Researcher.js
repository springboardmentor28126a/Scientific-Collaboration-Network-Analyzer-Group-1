import { useEffect, useState } from "react";
import API from "../api";
import { Link } from "react-router-dom";

function Researcher() {

  const [researchers, setResearchers] = useState([]);

  useEffect(() => {
    fetchResearchers();
  }, []);

  const fetchResearchers = async () => {
    try {
      const response = await API.get("/researcher");
      setResearchers(response.data);
    } catch (error) {
      console.log("Failed to load researchers", error);
    }
  };

  const deleteResearcher = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this researcher?"
    );

    if (!confirmDelete) return;

    try {
      await API.delete(`/researcher/${id}`);
      alert("Researcher deleted successfully.");
      fetchResearchers();
    } catch (error) {
      console.log("Delete failed", error);
      alert("Unable to delete researcher.");
    }
  };

  return (
    <div style={{ textAlign: "center", marginTop: "40px" }}>

      <h1>Researchers</h1>

      <Link to="/addresearcher">
        <button
          style={{
            padding: "10px 20px",
            marginBottom: "20px",
            cursor: "pointer"
          }}
        >
          Add Researcher
        </button>
      </Link>

      <table
        border="1"
        style={{
          width: "80%",
          margin: "auto",
          borderCollapse: "collapse"
        }}
      >
        <thead>
          <tr>
            <th>ID</th>
            <th>Username</th>
            <th>Email</th>
            <th>Role</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {researchers.map((researcher) => (
            <tr key={researcher.id}>
              <td>{researcher.id}</td>
              <td>{researcher.username}</td>
              <td>{researcher.email}</td>
              <td>{researcher.role}</td>

              <td>

                <Link to={`/editresearcher/${researcher.id}`}>
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
                  onClick={() => deleteResearcher(researcher.id)}
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

export default Researcher;