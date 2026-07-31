import { useState } from "react";
import API from "../api";

function AddPublication() {
  const [publication, setPublication] = useState({
    title: "",
    author: "",
    journal: "",
    year: "",
    type: "Journal Paper",
    status: "Draft",
  });

  const [file, setFile] = useState(null);

  const handleChange = (e) => {
    setPublication({
      ...publication,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Step 1: Create Publication
      const response = await API.post("/publication", publication);

      const publicationId = response.data.publication.id;

      // Step 2: Upload PDF if selected
      if (file) {
        const formData = new FormData();
        formData.append("file", file);

        await API.post(
          `/upload/${publicationId}`,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );
      }

      alert("Publication Added Successfully!");

      setPublication({
        title: "",
        author: "",
        journal: "",
        year: "",
        type: "Journal Paper",
        status: "Draft",
      });

      setFile(null);

    } catch (error) {
  console.log("Full Error:", error);

  if (error.response) {
    console.log("Status:", error.response.status);
    console.log("Data:", error.response.data);

    alert(JSON.stringify(error.response.data, null, 2));
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

        <label>Publication Type</label>

        <br />

        <select
          name="type"
          value={publication.type}
          onChange={handleChange}
        >
          <option value="Journal Paper">Journal Paper</option>
          <option value="Conference Paper">Conference Paper</option>
          <option value="Book">Book</option>
          <option value="Patent">Patent</option>
          <option value="Technical Report">Technical Report</option>
        </select>

        <br /><br />

        <label>Status</label>

        <br />

        <select
          name="status"
          value={publication.status}
          onChange={handleChange}
        >
          <option value="Draft">Draft</option>
          <option value="Submitted">Submitted</option>
          <option value="Under Review">Under Review</option>
          <option value="Published">Published</option>
          <option value="Rejected">Rejected</option>
        </select>

        <br /><br />

        <label>Select PDF File</label>

        <br />

        <input
          type="file"
          accept=".pdf"
          onChange={(e) => setFile(e.target.files[0])}
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