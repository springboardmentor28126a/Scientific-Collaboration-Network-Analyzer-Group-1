import { useState } from "react";
import API from "../api";

function AddPublication() {

  const [publication, setPublication] = useState({
    title: "",
    author: "",
    journal: "",
    year: ""
  });

  const handleChange = (e) => {
    setPublication({
      ...publication,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {

      await API.post("/publication", publication);

      alert("Publication added successfully!");

      setPublication({
        title: "",
        author: "",
        journal: "",
        year: ""
      });

    } catch (error) {

      console.log(error);

      if (error.response) {
        alert("Error: " + JSON.stringify(error.response.data));
      } else {
        alert("Failed to add publication.");
      }
    }
  };

  return (
    <div style={{ padding: "30px" }}>

      <h1>Add Publication</h1>

      <form onSubmit={handleSubmit}>

        <input
          type="text"
          name="title"
          placeholder="Publication Title"
          value={publication.title}
          onChange={handleChange}
        />

        <br /><br />

        <input
          type="text"
          name="author"
          placeholder="Author"
          value={publication.author}
          onChange={handleChange}
        />

        <br /><br />

        <input
          type="text"
          name="journal"
          placeholder="Journal"
          value={publication.journal}
          onChange={handleChange}
        />

        <br /><br />

        <input
          type="number"
          name="year"
          placeholder="Year"
          value={publication.year}
          onChange={handleChange}
        />

        <br /><br />

        <button type="submit">
          Add Publication
        </button>

      </form>

    </div>
  );
}

export default AddPublication;