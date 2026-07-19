import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import API from "../api";

function EditResearcher() {
  const { id } = useParams();
  console.log("Researcher ID:", id);
  const navigate = useNavigate();

  const [researcher, setResearcher] = useState({
    username: "",
    email: ""
  });

  useEffect(() => {
    const fetchResearcher = async () => {
      try {
        const response = await API.get(`/researcher/${id}`);

        setResearcher({
          username: response.data.username,
          email: response.data.email
        });
      } catch (error) {
        console.log(error);
        alert("Failed to load researcher");
      }
    };

    if (id) {
      fetchResearcher();
    }
  }, [id]);

  const handleChange = (e) => {
    setResearcher({
      ...researcher,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await API.put(`/researcher/${id}`, researcher);

      alert("Researcher Updated Successfully");

      navigate("/researcher");
    } catch (error) {
      console.log(error);
      alert("Failed to update researcher");
    }
  };

  return (
    <div style={{ padding: "30px" }}>
      <h1>Edit Researcher</h1>

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="username"
          value={researcher.username}
          onChange={handleChange}
          placeholder="Username"
        />

        <br />
        <br />

        <input
          type="email"
          name="email"
          value={researcher.email}
          onChange={handleChange}
          placeholder="Email"
        />

        <br />
        <br />

        <button type="submit">Update Researcher</button>
      </form>
    </div>
  );
}

export default EditResearcher;