import { useState } from "react";
import API from "../api";

function AddResearcher() {

  const [researcher, setResearcher] = useState({
    name: "",
    department: "",
    institution: ""
  });

  const handleChange = (e) => {
    setResearcher({
      ...researcher,
      [e.target.name]: e.target.value
    });
  };


  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await API.post("/researcher", researcher);

      alert("Researcher added successfully!");

      setResearcher({
        name: "",
        department: "",
        institution: ""
      });

    } catch (error) {
  console.log("Full error:", error);

  if (error.response) {
    console.log("Status:", error.response.status);
    console.log("Data:", error.response.data);
    alert("Error: " + JSON.stringify(error.response.data));
  } else if (error.request) {
    console.log("Request:", error.request);
    alert("Network Error - Request reached no server.");
  } else {
    console.log("Message:", error.message);
    alert(error.message);
  }
}
  };


  return (
    <div style={{ padding: "30px" }}>

      <h1>Add Researcher</h1>

      <form onSubmit={handleSubmit}>

        <input
          name="name"
          placeholder="Researcher Name"
          value={researcher.name}
          onChange={handleChange}
        />

        <br /><br />

        <input
          name="department"
          placeholder="Department"
          value={researcher.department}
          onChange={handleChange}
        />

        <br /><br />

        <input
          name="institution"
          placeholder="Institution"
          value={researcher.institution}
          onChange={handleChange}
        />

        <br /><br />

        <button type="submit">
          Add Researcher
        </button>

      </form>

    </div>
  );
}

export default AddResearcher;