import { useEffect, useState } from "react";
import API from "../api";

function Collaboration() {
  const [collaborations, setCollaborations] = useState([]);

  const [formData, setFormData] = useState({
    researcher1_id: "",
    researcher2_id: "",
    collaboration_type: "",
    project_name: "",
    start_date: "",
    end_date: "",
    status: "",
  });

  useEffect(() => {
    fetchCollaborations();
  }, []);

  const fetchCollaborations = async () => {
    try {
      const res = await API.get("/collaboration");
      setCollaborations(res.data);
    } catch (err) {
      console.log(err);

      if (err.response) {
        alert(JSON.stringify(err.response.data));
      } else {
        alert("Failed to load collaborations");
      }
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const addCollaboration = async (e) => {
    e.preventDefault();

    const data = {
      researcher1_id: Number(formData.researcher1_id),
      researcher2_id: Number(formData.researcher2_id),
      collaboration_type: formData.collaboration_type,
      project_name: formData.project_name,
      start_date: formData.start_date,
      end_date: formData.end_date,
      status: formData.status,
    };

    try {
      await API.post("/collaboration", data);

      alert("Collaboration added successfully!");

      setFormData({
        researcher1_id: "",
        researcher2_id: "",
        collaboration_type: "",
        project_name: "",
        start_date: "",
        end_date: "",
        status: "",
      });

      fetchCollaborations();

    } catch (err) {
      console.log(err);

      if (err.response) {
        console.log(err.response.data);
        alert(JSON.stringify(err.response.data));
      } else {
        alert("Failed to add collaboration");
      }
    }
  };

  const deleteCollaboration = async (id) => {
    try {
      await API.delete(`/collaboration/${id}`);
      alert("Collaboration deleted successfully!");
      fetchCollaborations();
    } catch (err) {
      console.log(err);

      if (err.response) {
        alert(JSON.stringify(err.response.data));
      } else {
        alert("Failed to delete collaboration");
      }
    }
  };

  return (
    <div className="container mt-4">

      <h2>Collaboration Management</h2>

      <form onSubmit={addCollaboration}>

        <input
          type="number"
          name="researcher1_id"
          placeholder="Researcher 1 ID"
          value={formData.researcher1_id}
          onChange={handleChange}
          className="form-control mb-2"
          required
        />

        <input
          type="number"
          name="researcher2_id"
          placeholder="Researcher 2 ID"
          value={formData.researcher2_id}
          onChange={handleChange}
          className="form-control mb-2"
          required
        />

        <input
          type="text"
          name="collaboration_type"
          placeholder="Collaboration Type"
          value={formData.collaboration_type}
          onChange={handleChange}
          className="form-control mb-2"
          required
        />

        <input
          type="text"
          name="project_name"
          placeholder="Project Name"
          value={formData.project_name}
          onChange={handleChange}
          className="form-control mb-2"
          required
        />

        <input
          type="date"
          name="start_date"
          value={formData.start_date}
          onChange={handleChange}
          className="form-control mb-2"
          required
        />

        <input
          type="date"
          name="end_date"
          value={formData.end_date}
          onChange={handleChange}
          className="form-control mb-2"
          required
        />

        <input
          type="text"
          name="status"
          placeholder="Status"
          value={formData.status}
          onChange={handleChange}
          className="form-control mb-2"
          required
        />

        <button type="submit" className="btn btn-primary">
          Add Collaboration
        </button>

      </form>

      <hr />

      <table className="table table-bordered">

        <thead>
          <tr>
            <th>ID</th>
            <th>Researcher 1</th>
            <th>Researcher 2</th>
            <th>Type</th>
            <th>Project</th>
            <th>Start Date</th>
            <th>End Date</th>
            <th>Status</th>
            <th>Delete</th>
          </tr>
        </thead>

        <tbody>

          {collaborations.map((c) => (
            <tr key={c.id}>
              <td>{c.id}</td>
              <td>{c.researcher1_id}</td>
              <td>{c.researcher2_id}</td>
              <td>{c.collaboration_type}</td>
              <td>{c.project_name}</td>
              <td>{c.start_date}</td>
              <td>{c.end_date}</td>
              <td>{c.status}</td>
              <td>
                <button
                  className="btn btn-danger"
                  onClick={() => deleteCollaboration(c.id)}
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

export default Collaboration;