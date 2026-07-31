import { useEffect, useState } from "react";
import API from "../api";
import { Link } from "react-router-dom";

function Publication() {
  const [publications, setPublications] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchPublications();
  }, []);

  const fetchPublications = async () => {
    try {
      const response = await API.get("/publication");
      setPublications(response.data);
    } catch (error) {
      console.log(error);
    }
  };

  const exportCSV = () => {
    window.open("http://127.0.0.1:8000/export/publications", "_blank");
  };

  const deletePublication = async (id) => {
    if (!window.confirm("Delete this publication?")) return;

    try {
      await API.delete(`/publication/${id}`);
      alert("Deleted Successfully");
      fetchPublications();
    } catch (error) {
      alert("Delete Failed");
    }
  };

  const filtered = publications.filter((item) =>
    item.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ width: "90%", margin: "40px auto" }}>
      <h1 style={{ textAlign: "center" }}>Publications</h1>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: "20px",
          alignItems: "center",
        }}
      >
        <input
          type="text"
          placeholder="Search Publication..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ width: "300px", padding: "8px" }}
        />

        <div>
          <button
            onClick={exportCSV}
            style={{ marginRight: "10px" }}
          >
            Export CSV
          </button>

          <Link to="/add-publication">
            <button>Add Publication</button>
          </Link>
        </div>
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
            <th>Title</th>
            <th>Author</th>
            <th>Journal</th>
            <th>Year</th>
            <th>Type</th>
            <th>Status</th>
            <th>File</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {filtered.length > 0 ? (
            filtered.map((publication) => (
              <tr key={publication.id}>
                <td>{publication.id}</td>
                <td>{publication.title}</td>
                <td>{publication.author}</td>
                <td>{publication.journal}</td>
                <td>{publication.year}</td>
                <td>{publication.type}</td>
                <td>{publication.status}</td>

                <td>
                  {publication.file_path ? (
                    <a
                      href={`http://127.0.0.1:8000/download/${publication.id}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Download PDF
                    </a>
                  ) : (
                    "No File"
                  )}
                </td>

                <td>
                  <Link to={`/edit-publication/${publication.id}`}>
                    <button>Edit</button>
                  </Link>

                  <button
                    onClick={() => deletePublication(publication.id)}
                    style={{ marginLeft: "10px" }}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="9" style={{ textAlign: "center" }}>
                No Publications Found
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default Publication;