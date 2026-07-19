import { useState } from "react";
import API from "../api";

function AddCollaboration() {

  const [collaboration, setCollaboration] = useState({
    researcher1_id: "",
    researcher2_id: "",
    collaboration_type: "",
    project_name: "",
    start_date: "",
    end_date: "",
    status: ""
  });

  const handleChange = (e) => {
    setCollaboration({
      ...collaboration,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await API.post("/collaboration", collaboration);

      alert("Collaboration added successfully!");

      setCollaboration({
        researcher1_id: "",
        researcher2_id: "",
        collaboration_type: "",
        project_name: "",
        start_date: "",
        end_date: "",
        status: ""
      });

    } catch (error) {
      console.log(error);

      if (error.response) {
        alert(JSON.stringify(error.response.data));
      } else {
        alert("Failed to add collaboration.");
      }
    }
  };

  return (
    <div style={{ padding: "30px" }}>

      <h1>Add Collaboration</h1>

      <form onSubmit={handleSubmit}>

        <input
          type="number"
          name="researcher1_id"
          placeholder="Researcher 1 ID"
          value={collaboration.researcher1_id}
          onChange={handleChange}
        />
        <br /><br />

        <input
          type="number"
          name="researcher2_id"
          placeholder="Researcher 2 ID"
          value={collaboration.researcher2_id}
          onChange={handleChange}
        />
        <br /><br />

        <input
          type="text"
          name="collaboration_type"
          placeholder="Collaboration Type"
          value={collaboration.collaboration_type}
          onChange={handleChange}
        />
        <br /><br />

        <input
          type="text"
          name="project_name"
          placeholder="Project Name"
          value={collaboration.project_name}
          onChange={handleChange}
        />
        <br /><br />

        <input
          type="date"
          name="start_date"
          value={collaboration.start_date}
          onChange={handleChange}
        />
        <br /><br />

        <input
          type="date"
          name="end_date"
          value={collaboration.end_date}
          onChange={handleChange}
        />
        <br /><br />

        <input
          type="text"
          name="status"
          placeholder="Status"
          value={collaboration.status}
          onChange={handleChange}
        />
        <br /><br />

        <button type="submit">
          Add Collaboration
        </button>

      </form>

    </div>
  );
}

export default AddCollaboration;