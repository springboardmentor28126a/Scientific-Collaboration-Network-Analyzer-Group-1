import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "./api/api";

function SignIn() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("Researcher");
  const [loading, setLoading] = useState(false);

  const handleSignIn = async (e) => {
    e.preventDefault();

    if (!name || !email || !password || !role) {
      alert("Please fill all details");
      return;
    }

    setLoading(false);

    try {
      setLoading(true);
      await api.post("/users/register", {
        name,
        email,
        password,
        role
      });
      alert("Account created successfully! Please log in.");
      navigate("/login");
    } catch (error) {
      console.error("Registration error:", error);
      if (error.response && error.response.data) {
        alert(error.response.data.detail || "Failed to create account.");
      } else {
        alert(error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <form onSubmit={handleSignIn}>
        <h2>Create Account</h2>

        <input
          type="text"
          placeholder="Full Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Create Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          style={{
            width: "90%",
            padding: "15px",
            margin: "12px 0",
            borderRadius: "25px",
            border: "2px solid #1b4f8a",
            background: "#111",
            color: "white",
            fontSize: "16px",
            outline: "none",
            boxSizing: "content-box",
            cursor: "pointer"
          }}
        >
          <option value="Researcher">Researcher</option>
          <option value="Institution Admin">Institution Admin</option>
          <option value="Reviewer">Reviewer</option>
          <option value="System Admin">System Admin</option>
        </select>

        <button type="submit" disabled={loading}>
          {loading ? "Creating..." : "Sign In"}
        </button>

        <p className="login-text">
          Already signed in?{" "}
          <span 
            className="login-link"
            onClick={() => navigate("/login")}
          >
            Login
          </span>
        </p>
      </form>
    </div>
  );
}

export default SignIn;