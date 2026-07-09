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
    const statsCard = {

    background: "white",

    padding: "25px",

    borderRadius: "15px",

    textAlign: "center",

    boxShadow: "0 5px 15px rgba(0,0,0,.1)"

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
    <div
  style={{
    display: "grid",
    gridTemplateColumns: "repeat(4,1fr)",
    gap: "20px",
    marginBottom: "30px",
  }}
>
  <div style={statsCard}>
    <h3>📚 Total</h3>
    <h1>{publications.length}</h1>
  </div>

  <div style={statsCard}>
    <h3>🟢 Published</h3>
    <h1>
      {
        publications.filter(
          (p) => p.status === "Published"
        ).length
      }
    </h1>
  </div>

  <div style={statsCard}>
    <h3>🟡 Draft</h3>
    <h1>
      {
        publications.filter(
          (p) => p.status === "Draft"
        ).length
      }
    </h1>
  </div>

  <div style={statsCard}>
    <h3>🔵 Submitted</h3>
    <h1>
      {
        publications.filter(
          (p) => p.status === "Submitted"
        ).length
      }
    </h1>
  </div>
</div> 

     <div
  style={{
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))",
    gap: "20px",
    marginTop: "30px",
  }}
>
  {publications.map((publication) => (
    <div
      key={publication.id}
      style={{
        background: "white",
        borderRadius: "15px",
        padding: "20px",
        boxShadow: "0 5px 15px rgba(0,0,0,0.1)",
      }}
    >
      <h2 style={{ color: "#2563eb" }}>
        📄 {publication.title}
      </h2>

      <p><b>👨‍🔬 Authors:</b> {publication.authors}</p>

      <p><b>📚 Journal:</b> {publication.journal}</p>

      <p><b>📅 Year:</b> {publication.publication_year}</p>

      <p>
        <b>Status:</b>{" "}
        <span
          style={{
            color:
              publication.status === "Published"
                ? "green"
                : publication.status === "Draft"
                ? "orange"
                : "blue",
            fontWeight: "bold",
          }}
        >
          {publication.status}
        </span>
      </p>

      <p><b>🔗 DOI:</b> {publication.doi || "N/A"}</p>

      <p><b>🏷 Keywords:</b> {publication.keywords || "N/A"}</p>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginTop: "20px",
        }}
      >
        <button
          style={{
            background: "#2563eb",
            color: "white",
            border: "none",
            padding: "8px 14px",
            borderRadius: "8px",
            cursor: "pointer",
          }}
        >
          👁 View
        </button>

        <button
          style={{
            background: "#22c55e",
            color: "white",
            border: "none",
            padding: "8px 14px",
            borderRadius: "8px",
            cursor: "pointer",
          }}
        >
          ✏ Edit
        </button>

        <button
          onClick={() => deletePublication(publication.id)}
          style={{
            background: "#ef4444",
            color: "white",
            border: "none",
            padding: "8px 14px",
            borderRadius: "8px",
            cursor: "pointer",
          }}
        >
          🗑 Delete
        </button>
      </div>
    </div>
  ))}
</div>

    </div>
  );
}

export default Publications;
