import "../css/register.css";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import API from "../services/api";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";

function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const registerUser = async (e) => {
    if (e) e.preventDefault();
    if (!name || !email || !password) {
      toast.error("Please fill in all mandatory fields");
      return;
    }
    try {
      const response = await API.post("/register", {
        name,
        email,
        password
      });
     
      toast.success(response.data.message);
      navigate("/login");

    } catch (error) {
      if (error.response?.status === 500) {
        toast.error("Registration Failed: Email might already exist");
      } else {
        toast.error(error.response?.data?.detail || "Registration Failed");
      }
      console.log(error);
    }
  };

 return (
  <div className="register-container">
    <div className="register-card">

      <h2>User Registration</h2>

      <div className="input-group">
        <label>Name <span className="mandatory">*</span></label>
        <input
          type="text"
          placeholder="Name"
          onChange={(e) => setName(e.target.value)}
        />
      </div>

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

      <button onClick={registerUser}>
        Register
      </button>

      <p>
        Already have an account?{" "}
        <Link to="/login">Login here</Link>
      </p>

    </div>
  </div>
);
}

export default Register;