import "../css/login.css";
import { useState } from "react";
import API from "../services/api";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const loginUser = async (e) => {
    if (e) e.preventDefault();
    if (!email || !password) {
      toast.error("Please fill in all mandatory fields");
      return;
    }
    try {
      const formData = new URLSearchParams();

      formData.append("username", email);
      formData.append("password", password);

      const response = await API.post("/login", formData, {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      });

      console.log("Full Response:", response.data);
      console.log("Access Token:", response.data.access_token);

      localStorage.setItem("token", response.data.access_token);

      console.log("Stored Token:", localStorage.getItem("token"));

      toast.success("Login Successful!");

      navigate("/dashboard");

    } catch (error) {
      console.log("Error Response:", error.response);
      console.log("Error Data:", error.response?.data);
      toast.error(error.response?.data?.detail || "Login failed");
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">

        <h2>User Login</h2>

        <div className="input-group">
          <label>Email <span className="mandatory">*</span></label>
          <input
            type="email"
            placeholder="Email"
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="input-group">
          <label>Password <span className="mandatory">*</span></label>
          <input
            type="password"
            placeholder="Password"
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <button onClick={loginUser}>
          Login
        </button>

        <p>
          Don't have an account?{" "}
          <Link to="/register">Register here</Link>
        </p>

      </div>
    </div>
  );
}

export default Login;