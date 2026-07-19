import { useState } from "react";
import API from "../api";

function AddProject() {

  const [project, setProject] = useState({
    title: "",
    description: "",
    funding_agency: "",
    start_date: "",
    end_date: "",
    status: ""
  });

  const handleChange = (e) => {
    setProject({
      ...project,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {

    e.preventDefault();

    try {

      await API.post("/project", project);

      alert("Project added successfully!");

      setProject({
        title: "",
        description: "",
        funding_agency: "",
        start_date: "",
        end_date: "",
        status: ""
      });

    } catch (error) {

      console.log(error);

      alert("Failed to add project.");

    }

  };

  return (

    <div style={{ padding: "30px" }}>

      <h1>Add Project</h1>

      <form onSubmit={handleSubmit}>

        <input
          type="text"
          name="title"
          placeholder="Project Title"
          value={project.title}
          onChange={handleChange}
        />

        <br /><br />

        <input
          type="text"
          name="description"
          placeholder="Description"
          value={project.description}
          onChange={handleChange}
        />

        <br /><br />

        <input
          type="text"
          name="funding_agency"
          placeholder="Funding Agency"
          value={project.funding_agency}
          onChange={handleChange}
        />

        <br /><br />

        <input
          type="date"
          name="start_date"
          value={project.start_date}
          onChange={handleChange}
        />

        <br /><br />

        <input
          type="date"
          name="end_date"
          value={project.end_date}
          onChange={handleChange}
        />

        <br /><br />

        <input
          type="text"
          name="status"
          placeholder="Status"
          value={project.status}
          onChange={handleChange}
        />

        <br /><br />

        <button type="submit">
          Add Project
        </button>

      </form>

    </div>

  );
}

export default AddProject;