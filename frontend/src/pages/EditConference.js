import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import API from "../api";

function EditConference() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [conference, setConference] = useState({
    name: "",
    location: "",
    date: "",
    organizer: ""
  });

  useEffect(() => {
    const fetchConference = async () => {
      try {
        const response = await API.get(`/conference/${id}`);

        setConference({
          name: response.data.name,
          location: response.data.location,
          date: response.data.date,
          organizer: response.data.organizer
        });
      } catch (error) {
        console.log(error);
        alert("Failed to load conference.");
      }
    };

    fetchConference();
  }, [id]);

  const handleChange = (e) => {
    setConference({
      ...conference,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await API.put(`/conference/${id}`, conference);

      alert("Conference updated successfully.");

      navigate("/conference");
    } catch (error) {
      console.log(error);
      alert("Failed to update conference.");
    }
  };

  return (
    <div style={{ padding: "30px" }}>
      <h1>Edit Conference</h1>

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="name"
          value={conference.name}
          onChange={handleChange}
          placeholder="Conference Name"
        />

        <br /><br />

        <input
          type="text"
          name="location"
          value={conference.location}
          onChange={handleChange}
          placeholder="Location"
        />

        <br /><br />

        <input
          type="text"
          name="date"
          value={conference.date}
          onChange={handleChange}
          placeholder="Date"
        />

        <br /><br />

        <input
          type="text"
          name="organizer"
          value={conference.organizer}
          onChange={handleChange}
          placeholder="Organizer"
        />

        <br /><br />

        <button type="submit">
          Update Conference
        </button>
      </form>
    </div>
  );
}

export default EditConference;