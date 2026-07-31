import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api";

function AddCitation() {
  const navigate = useNavigate();

  const [citation, setCitation] = useState({
    publication_id: "",
    author: "",
    title: "",
    journal: "",
    year: "",
    doi: "",
  });

  const handleChange = (e) => {
    setCitation({
      ...citation,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await API.post("/citation", citation);

      alert("Citation Added Successfully");

      navigate("/citation");
    } catch (error) {
      alert("Failed to Add Citation");
      console.log(error);
    }
  };

  return (
    <div style={{ width: "500px", margin: "40px auto" }}>
      <h1>Add Citation</h1>

      <form onSubmit={handleSubmit}>

        <input
          type="number"
          name="publication_id"
          placeholder="Publication ID"
          value={citation.publication_id}
          onChange={handleChange}
          required
        />

        <br /><br />

        <input
          type="text"
          name="author"
          placeholder="Author"
          value={citation.author}
          onChange={handleChange}
          required
        />

        <br /><br />

        <input
          type="text"
          name="title"
          placeholder="Title"
          value={citation.title}
          onChange={handleChange}
          required
        />

        <br /><br />

        <input
          type="text"
          name="journal"
          placeholder="Journal"
          value={citation.journal}
          onChange={handleChange}
          required
        />

        <br /><br />

        <input
          type="number"
          name="year"
          placeholder="Year"
          value={citation.year}
          onChange={handleChange}
          required
        />

        <br /><br />

        <input
          type="text"
          name="doi"
          placeholder="DOI"
          value={citation.doi}
          onChange={handleChange}
        />

        <br /><br />

        <button type="submit">
          Add Citation
        </button>

      </form>
    </div>
  );
}

export default AddCitation;