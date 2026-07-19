import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import API from "../api";

function EditProject() {

  const { id } = useParams();
  const navigate = useNavigate();

  const [project, setProject] = useState({
    title: "",
    description: "",
    funding_agency: "",
    start_date: "",
    end_date: "",
    status: ""
  });

  useEffect(() => {
    fetchProject();
  }, []);

  const fetchProject = async () => {
    try {
      const response = await API.get(`/project/${id}`);
      setProject(response.data);
    } catch (error) {
      console.log(error);
      alert("Failed to load project.");
    }
  };

  const handleChange = (e) => {
    setProject({
      ...project,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {

      await API.put(`/project/${id}`, project);

      alert("Project updated successfully!");

      navigate("/project");

    } catch (error) {

      console.log(error);

      alert("Failed to update project.");

    }
  };

  return (
    <div style={{ padding: "30px" }}>

      <h1>Edit Project</h1>

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
          Update Project
        </button>

      </form>

    </div>
  );
}

export default EditProject;