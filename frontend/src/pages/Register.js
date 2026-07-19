import { useState } from "react";
import API from "../api";

function Register() {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    role: ""
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await API.post(
        "/register",
        formData
    );

      alert(response.data.message);
    } catch (error) {
      console.log(error);
      alert("Registration Failed");
    }
  };

  return (
    <div style={{ padding: "30px" }}>
      <h1>Researcher Registration</h1>

      <form onSubmit={handleSubmit}>

        <input
          type="text"
          name="username"
          placeholder="Username"
          onChange={handleChange}
        />
        <br /><br />

        <input
          type="email"
          name="email"
          placeholder="Email"
          onChange={handleChange}
        />
        <br /><br />

        <input
          type="password"
          name="password"
          placeholder="Password"
          onChange={handleChange}
        />
        <br /><br />

        <input
          type="text"
          name="role"
          placeholder="Role (Researcher)"
          onChange={handleChange}
        />
        <br /><br />

        <button type="submit">Register</button>

      </form>
    </div>
  );
}

export default Register;