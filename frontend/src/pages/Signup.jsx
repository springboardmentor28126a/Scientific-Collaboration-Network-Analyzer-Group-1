import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";

function Signup() {
    console.log("Signup Loaded");
  const navigate = useNavigate();

  const [full_name, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSignup = async () => {
    console.log("Register button clicked");
    try {
      const response = await api.post("/auth/register", {
        full_name,
        email,
        password,
      });

      alert(response.data.message);

      navigate("/");
    } catch (error) {
      if (error.response) {
        alert(error.response.data.detail);
      } else {
        alert("Something went wrong");
      }
    }
  };

  return (
    <div style={{ textAlign: "center", marginTop: "100px" }}>
      <h1>Scientific Collaboration Network Analyzer</h1>

      <h2>Signup</h2>

      <input
        type="text"
        placeholder="Full Name"
        value={full_name}
        onChange={(e) => setFullName(e.target.value)}
      />

      <br />
      <br />

      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <br />
      <br />

      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <br />
      <br />

      <button
  onClick={() => {
    alert("Button Clicked");
    console.log("Button Clicked");
    handleSignup();
  }}
>
  Register
</button>

      <p>
        Already have an account?{" "}
        <Link to="/">Login</Link>
      </p>
    </div>
  );
}

export default Signup;