import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Login() {

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();

    if(username && password){
      navigate("/dashboard");
    }
    else{
      alert("Please enter username and password");
    }
  };


  return (
    <div className="login-container">

      <form onSubmit={handleLogin}>

        <h2>Login</h2>

        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e)=>setUsername(e.target.value)}
        />


        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e)=>setPassword(e.target.value)}
        />


        <button type="submit">
          Login
        </button>


      </form>

    </div>
  );
}

export default Login;