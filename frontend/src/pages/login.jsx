import { useState } from "react";
import API from "../services/api";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const loginUser = async () => {
  try {
    const formData = new URLSearchParams();

    formData.append("username", email); // OAuth2 uses username
    formData.append("password", password);

    const response = await API.post("/login", formData, {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });

    localStorage.setItem("token", response.data.access_token);
    navigate("/researcher");

    alert("Login Successful!");
    console.log(response.data);

  } catch (error) {
    console.log(error.response);
    console.log(error.response.data);
    alert(JSON.stringify(error.response.data));
}
};

  return (
    <div>
      <h2>User Login</h2>

      <input
        type="email"
        placeholder="Email"
        onChange={(e) => setEmail(e.target.value)}
      />

      <br /><br />

      <input
        type="password"
        placeholder="Password"
        onChange={(e) => setPassword(e.target.value)}
      />

      <br /><br />

      <button onClick={loginUser}>
        Login
      </button>
      <p>
        Don't have an account? <Link to="/register">Register here</Link>
      </p>
    </div>
  );
}

export default Login;