import { useEffect, useState } from "react";
import API from "../api";
import { Link } from "react-router-dom";

function Researcher() {
  const [researchers, setResearchers] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchResearchers();
  }, []);

  const fetchResearchers = async () => {
    setLoading(true);

    try {
      const response = await API.get("/researcher");
      setResearchers(response.data);
    } catch (error) {
      console.log("Failed to load researchers", error);
    } finally {
      setLoading(false);
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

  const filteredResearchers = researchers.filter((researcher) =>
    researcher.username.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ width: "90%", margin: "40px auto" }}>
      <h1 style={{ textAlign: "center" }}>Researchers</h1>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: "20px",
        }}
      >
        <input
          type="text"
          placeholder="Search Researcher..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            width: "300px",
            padding: "8px",
          }}
        />

        <Link to="/add-researcher">
          <button
            style={{
              padding: "10px 20px",
              cursor: "pointer",
            }}
          >
            Add Researcher
          </button>
        </Link>
      </div>

      {loading ? (
        <h3 style={{ textAlign: "center" }}>Loading...</h3>
      ) : (
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
              <th>Username</th>
              <th>Email</th>
              <th>Role</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {filteredResearchers.length > 0 ? (
              filteredResearchers.map((researcher) => (
                <tr key={researcher.id}>
                  <td>{researcher.id}</td>
                  <td>{researcher.username}</td>
                  <td>{researcher.email}</td>
                  <td>{researcher.role}</td>

                  <td>
                    <Link to={`/edit-researcher/${researcher.id}`}>
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
                      onClick={() => deleteResearcher(researcher.id)}
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
                <td
                  colSpan="5"
                  style={{
                    textAlign: "center",
                    padding: "15px",
                  }}
                >
                  No Researchers Found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default Researcher;