import { useState } from "react";
import API from "../api";

function AddConference() {

  const [conference, setConference] = useState({
    name: "",
    location: "",
    date: "",
    organizer: ""
  });

  const handleChange = (e) => {
    setConference({
      ...conference,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {

      await API.post("/conference", conference);

      alert("Conference added successfully!");

      setConference({
        name: "",
        location: "",
        date: "",
        organizer: ""
      });

    } catch (error) {

      console.log(error);

      if (error.response) {
        alert("Error: " + JSON.stringify(error.response.data));
      } else {
        alert("Failed to add conference.");
      }

    }
  };

  return (

    <div style={{ padding: "30px" }}>

      <h1>Add Conference</h1>

      <form onSubmit={handleSubmit}>

        <input
          type="text"
          name="name"
          placeholder="Conference Name"
          value={conference.name}
          onChange={handleChange}
        />

        <br /><br />

        <input
          type="text"
          name="location"
          placeholder="Location"
          value={conference.location}
          onChange={handleChange}
        />

        <br /><br />

        <input
          type="text"
          name="date"
          placeholder="Date (DD-MM-YYYY)"
          value={conference.date}
          onChange={handleChange}
        />

        <br /><br />

        <input
          type="text"
          name="organizer"
          placeholder="Organizer"
          value={conference.organizer}
          onChange={handleChange}
        />

        <br /><br />

        <button type="submit">
          Add Conference
        </button>

      </form>

    </div>

  );
}

export default AddConference;