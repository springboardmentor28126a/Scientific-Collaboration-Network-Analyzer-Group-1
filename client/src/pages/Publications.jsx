import { useEffect, useState } from "react";
import API from "../services/api";

function Publications() {
  const [publications, setPublications] = useState([]);
  const [searchTitle, setSearchTitle] = useState("");

  const [form, setForm] = useState({
    id: null,
    title: "",
    authors: "",
    journal: "",
    publication_year: "",
    doi: "",
    keywords: "",
    status: "Draft",
    researcher_id: null,
  });

  useEffect(() => {
    loadPublications();
  }, []);

  const loadPublications = async () => {
    try {
      const response = await API.get("/publications/");
      setPublications(response.data);
    } catch (error) {
      console.log(error);
    }
  };

  const searchPublication = async () => {
    try {
      if (searchTitle.trim() === "") {
        loadPublications();
        return;
      }

      const response = await API.get(
        `/publications/search/${searchTitle}`
      );

      setPublications(response.data);
    } catch (error) {
      alert("No publications found");
    }
  };

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const addPublication = async () => {
    try {
      await API.post("/publications/", form);

      alert("Publication Added Successfully");

      loadPublications();

      setForm({
        id: null,
        title: "",
        authors: "",
        journal: "",
        publication_year: "",
        doi: "",
        keywords: "",
        status: "Draft",
        researcher_id: null,
      });

    } catch (error) {
      console.log(error);
    }
  };

  const deletePublication = async (id) => {
    try {
      await API.delete(`/publications/${id}`);

      alert("Publication Deleted Successfully");

      loadPublications();
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div style={{ padding: "30px" }}>

      <h1>Scientific Collaboration Network Analyzer</h1>

      <h2>Publication Management</h2>

      {/* Search */}

      <div style={{ marginBottom: "20px" }}>

        <input
          type="text"
          placeholder="Search by Title"
          value={searchTitle}
          onChange={(e) => setSearchTitle(e.target.value)}
        />

        <button
          onClick={searchPublication}
          style={{ marginLeft: "10px" }}
        >
          Search
        </button>

        <button
          onClick={loadPublications}
          style={{ marginLeft: "10px" }}
        >
          Show All
        </button>

      </div>

      {/* Add Publication */}

      <div style={{ marginBottom: "20px" }}>

        <input
          type="text"
          name="title"
          placeholder="Title"
          value={form.title}
          onChange={handleChange}
        />

        <input
          type="text"
          name="authors"
          placeholder="Authors"
          value={form.authors}
          onChange={handleChange}
        />

        <input
          type="text"
          name="journal"
          placeholder="Journal"
          value={form.journal}
          onChange={handleChange}
        />

        <input
          type="number"
          name="publication_year"
          placeholder="Year"
          value={form.publication_year}
          onChange={handleChange}
        />

        <input
          type="text"
          name="doi"
          placeholder="DOI"
          value={form.doi}
          onChange={handleChange}
        />

        <input
          type="text"
          name="keywords"
          placeholder="Keywords"
          value={form.keywords}
          onChange={handleChange}
        />

        <select
          name="status"
          value={form.status}
          onChange={handleChange}
        >
          <option>Draft</option>
          <option>Submitted</option>
          <option>Published</option>
          <option>Archived</option>
        </select>

        <button onClick={addPublication}>
          Add Publication
        </button>

      </div>

      <table
        border="1"
        cellPadding="10"
        style={{
          width: "100%",
          borderCollapse: "collapse",
        }}
      >
        <thead>
          <tr>
            <th>ID</th>
            <th>Title</th>
            <th>Authors</th>
            <th>Journal</th>
            <th>Year</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>

        <tbody>
          {publications.map((publication) => (
            <tr key={publication.id}>
              <td>{publication.id}</td>
              <td>{publication.title}</td>
              <td>{publication.authors}</td>
              <td>{publication.journal}</td>
              <td>{publication.publication_year}</td>
              <td>{publication.status}</td>

              <td>
                <button
                  onClick={() => deletePublication(publication.id)}
                  style={{
                    backgroundColor: "red",
                    color: "white",
                    border: "none",
                    padding: "6px 10px",
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
  );
}

export default Publications;