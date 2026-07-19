import { useEffect, useState } from "react";
import API from "../api";
import { Link } from "react-router-dom";

function Project() {

  const [projects, setProjects] = useState([]);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await API.get("/project");
      setProjects(response.data);
    } catch (error) {
      console.log("Failed to load projects", error);
    }
  };

  const deleteProject = async (id) => {

    const confirmDelete = window.confirm(
      "Are you sure you want to delete this project?"
    );

    if (!confirmDelete) return;

    try {

      await API.delete(`/project/${id}`);

      alert("Project deleted successfully.");

      fetchProjects();

    } catch (error) {

      console.log(error);

      alert("Failed to delete project.");

    }
  };

  return (

    <div style={{ textAlign: "center", marginTop: "40px" }}>

      <h1>Projects</h1>

      <Link to="/addproject">
        <button
          style={{
            padding: "10px 20px",
            marginBottom: "20px",
            cursor: "pointer"
          }}
        >
          Add Project
        </button>
      </Link>

      <table
        border="1"
        style={{
          width: "95%",
          margin: "auto",
          borderCollapse: "collapse"
        }}
      >

        <thead>
          <tr>
            <th>ID</th>
            <th>Title</th>
            <th>Description</th>
            <th>Funding Agency</th>
            <th>Start Date</th>
            <th>End Date</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>

          {projects.map((project) => (

            <tr key={project.id}>

              <td>{project.id}</td>
              <td>{project.title}</td>
              <td>{project.description}</td>
              <td>{project.funding_agency}</td>
              <td>{project.start_date}</td>
              <td>{project.end_date}</td>
              <td>{project.status}</td>

              <td>

                <Link to={`/editproject/${project.id}`}>
                  <button style={{ marginRight: "10px" }}>
                    Edit
                  </button>
                </Link>

                <button
                  onClick={() => deleteProject(project.id)}
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

export default Project;