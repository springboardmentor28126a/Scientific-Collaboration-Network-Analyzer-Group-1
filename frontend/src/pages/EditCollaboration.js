import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import API from "../api";

function EditCollaboration() {

  const { id } = useParams();
  const navigate = useNavigate();

  const [collaboration, setCollaboration] = useState({
    researcher1_id: "",
    researcher2_id: "",
    collaboration_type: "",
    project_name: "",
    start_date: "",
    end_date: "",
    status: "",
  });

  useEffect(() => {
    fetchCollaboration();
  }, []);

  const fetchCollaboration = async () => {
    try {
      const res = await API.get("/collaboration");
      const data = res.data.find((item) => item.id === Number(id));
      if (data) {
        setCollaboration(data);
      }
    } catch (err) {
      console.log(err);
    }
  };

  const handleChange = (e) => {
    setCollaboration({
      ...collaboration,
      [e.target.name]: e.target.value,
    });
  };

  const updateCollaboration = async (e) => {
    e.preventDefault();

    try {
      await API.put(`/collaboration/${id}`, collaboration);
      alert("Collaboration Updated Successfully");
      navigate("/collaboration");
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className="container mt-4">

      <h2>Edit Collaboration</h2>

      <form onSubmit={updateCollaboration}>

        <input
          type="number"
          name="researcher1_id"
          value={collaboration.researcher1_id}
          onChange={handleChange}
          className="form-control mb-2"
        />

        <input
          type="number"
          name="researcher2_id"
          value={collaboration.researcher2_id}
          onChange={handleChange}
          className="form-control mb-2"
        />

        <input
          type="text"
          name="collaboration_type"
          value={collaboration.collaboration_type}
          onChange={handleChange}
          className="form-control mb-2"
        />

        <input
          type="text"
          name="project_name"
          value={collaboration.project_name}
          onChange={handleChange}
          className="form-control mb-2"
        />

        <input
          type="date"
          name="start_date"
          value={collaboration.start_date}
          onChange={handleChange}
          className="form-control mb-2"
        />

        <input
          type="date"
          name="end_date"
          value={collaboration.end_date}
          onChange={handleChange}
          className="form-control mb-2"
        />

        <input
          type="text"
          name="status"
          value={collaboration.status}
          onChange={handleChange}
          className="form-control mb-2"
        />

        <button className="btn btn-success">
          Update Collaboration
        </button>

      </form>

    </div>
  );
}

export default EditCollaboration;