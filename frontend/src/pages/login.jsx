import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("researcher");
  

  const handleLogin = async () => {
    try {
      const response = await api.post("/auth/login", {
    email,
    password,
    role,
});
console.log(response.data);
      localStorage.setItem("token", response.data.access_token);
      localStorage.setItem("role", role);
      localStorage.setItem("email", email);

      alert("Login Successful");

      navigate("/dashboard");
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
    color: "#0931a7",
    fontSize: "42px",
    lineHeight: "1.2",
    marginBottom: "10px",
    fontWeight: "bold",
  }}
>
  Scientific Collaboration
</h1>

<p
  style={{
    color: "#000000",
    marginBottom: "30px",
    fontSize: "20px",
  }}
>
  Network Analyzer
</p>

        <h2 style={{ marginBottom: "25px" }}>Login</h2>

        <input
          type="Email"
          placeholder="Enter Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{
            width: "100%",
            padding: "14px",
            marginBottom: "15px",
            borderRadius: "8px",
            border: "1px solid #f71414",
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
            border: "1px solid #f30505",
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
          onClick={handleLogin}
          style={{
            width: "100%",
            padding: "14px",
            background: "#010204",
            color: "white",
            border: "none",
            borderRadius: "8px",
            fontSize: "16px",
            cursor: "pointer",
          }}
        >
          Login
        </button>

        <p style={{ marginTop: "20px" }}>
          Don't have an account?{" "}
          <Link
            to="/signup"
            style={{
              color: "#2556eb",
              fontWeight: "bold",
              textDecoration: "none",
            }}
          >
            Signup
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Login;