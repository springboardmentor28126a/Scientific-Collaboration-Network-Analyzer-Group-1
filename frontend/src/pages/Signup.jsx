import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";

function Signup() {
  const navigate = useNavigate();

  const [full_name, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("researcher");

  const handleSignup = async () => {
    try {
      const response = await api.post("/auth/register", {
        full_name,
        email,
        password,
        role,
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
    <div
      style={{
        height: "100vh",
        background: "linear-gradient(135deg,#2563eb,#1e3a8a)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div
        style={{
          width: "420px",
          background: "white",
          padding: "40px",
          borderRadius: "15px",
          boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
          textAlign: "center",
        }}
      >
        <h1
          style={{
            color: "#2563eb",
            fontSize: "42px",
            lineHeight: "1.2",
            marginBottom: "10px",
            fontWeight: "bold",
          }}
        >
          Scientific
          <br />
          Collaboration
        </h1>

        <p
          style={{
            color: "#555",
            marginBottom: "30px",
            fontSize: "18px",
          }}
        >
          Network Analyzer
        </p>

        <h2 style={{ marginBottom: "25px" }}>
          Create Account
        </h2>

        <input
          type="text"
          placeholder="Full Name"
          value={full_name}
          onChange={(e) => setFullName(e.target.value)}
          style={{
            width: "100%",
            padding: "14px",
            marginBottom: "15px",
            borderRadius: "8px",
            border: "1px solid #ccc",
            fontSize: "15px",
            boxSizing: "border-box",
          }}
        />

        <input
          type="email"
          placeholder="Enter Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{
            width: "100%",
            padding: "14px",
            marginBottom: "15px",
            borderRadius: "8px",
            border: "1px solid #ccc",
            fontSize: "15px",
            boxSizing: "border-box",
          }}
        />

        <input
          type="password"
          placeholder="Enter Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{
            width: "100%",
            padding: "14px",
            marginBottom: "25px",
            borderRadius: "8px",
            border: "1px solid #ccc",
            fontSize: "15px",
            boxSizing: "border-box",
          }}
        />
<select
  value={role}
  onChange={(e) => setRole(e.target.value)}
  style={{
    width: "100%",
    padding: "14px",
    marginBottom: "25px",
    borderRadius: "8px",
    border: "1px solid #ccc",
    fontSize: "15px",
    boxSizing: "border-box",
  }}
>
  <option value="researcher">Researcher</option>
<option value="institution_admin">Institution Admin</option>
<option value="reviewer">Reviewer</option>
<option value="system_admin">System Administrator</option>
</select>
        <button
          onClick={handleSignup}
          style={{
            width: "100%",
            padding: "14px",
            background: "#2563eb",
            color: "white",
            border: "none",
            borderRadius: "8px",
            fontSize: "16px",
            cursor: "pointer",
          }}
        >
          Register
        </button>

        <p style={{ marginTop: "20px" }}>
          Already have an account?{" "}
          <Link
            to="/"
            style={{
              color: "#2563eb",
              textDecoration: "none",
              fontWeight: "bold",
            }}
          >
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Signup;