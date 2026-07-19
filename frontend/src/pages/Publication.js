import { useEffect, useState } from "react";
import API from "../api";
import { Link } from "react-router-dom";

function Publication() {

  const [publications, setPublications] = useState([]);

  useEffect(() => {
    fetchPublications();
  }, []);

  const fetchPublications = async () => {
    try {
      const response = await API.get("/publication");
      setPublications(response.data);
    } catch (error) {
      console.log("Failed to load publications", error);
    }
  };

  const deletePublication = async (id) => {

    const confirmDelete = window.confirm(
      "Are you sure you want to delete this publication?"
    );

    if (!confirmDelete) return;

    try {

      await API.delete(`/publication/${id}`);

      alert("Publication deleted successfully.");

      fetchPublications();

    } catch (error) {

      console.log(error);

      alert("Failed to delete publication.");

    }
  };

  return (

    <div style={{ textAlign: "center", marginTop: "40px" }}>

      <h1>Publications</h1>

      <Link to="/addpublication">
        <button
          style={{
            padding: "10px 20px",
            marginBottom: "20px",
            cursor: "pointer"
          }}
        >
          Add Publication
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
            <th>Title</th>
            <th>Author</th>
            <th>Journal</th>
            <th>Year</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>

          {publications.map((publication) => (

            <tr key={publication.id}>

              <td>{publication.id}</td>
              <td>{publication.title}</td>
              <td>{publication.author}</td>
              <td>{publication.journal}</td>
              <td>{publication.year}</td>

              <td>

                <Link to={`/editpublication/${publication.id}`}>
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
                  onClick={() => deletePublication(publication.id)}
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

export default Publication;