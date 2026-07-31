import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../api";

function Citation() {
  const [citations, setCitations] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchCitations();
  }, []);

  const fetchCitations = async () => {
    try {
      const response = await API.get("/citation");
      setCitations(response.data);
    } catch (error) {
      console.log(error);
    }
  };

  const deleteCitation = async (id) => {
    if (!window.confirm("Delete this citation?")) return;

    try {
      await API.delete(`/citation/${id}`);
      alert("Citation Deleted Successfully");
      fetchCitations();
    } catch (error) {
      alert("Delete Failed");
    }
  };

  const filtered = citations.filter((citation) =>
    citation.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ width: "90%", margin: "40px auto" }}>
      <h1 style={{ textAlign: "center" }}>Citations</h1>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: "20px",
        }}
      >
        <input
          type="text"
          placeholder="Search Citation..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ width: "300px", padding: "8px" }}
        />

        <Link to="/add-citation">
          <button>Add Citation</button>
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
            <th>Publication ID</th>
            <th>Author</th>
            <th>Title</th>
            <th>Journal</th>
            <th>Year</th>
            <th>DOI</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {filtered.length > 0 ? (
            filtered.map((citation) => (
              <tr key={citation.id}>
                <td>{citation.id}</td>
                <td>{citation.publication_id}</td>
                <td>{citation.author}</td>
                <td>{citation.title}</td>
                <td>{citation.journal}</td>
                <td>{citation.year}</td>
                <td>{citation.doi}</td>

                <td>
                  <Link to={`/edit-citation/${citation.id}`}>
                    <button>Edit</button>
                  </Link>

                  <button
                    onClick={() => deleteCitation(citation.id)}
                    style={{ marginLeft: "10px" }}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="8" style={{ textAlign: "center" }}>
                No Citations Found
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default Citation;