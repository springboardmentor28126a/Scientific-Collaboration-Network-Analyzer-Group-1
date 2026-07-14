import { useState } from "react";
import { useNavigate } from "react-router-dom";

function SignIn() {

  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSignIn = (e) => {
    e.preventDefault();

    if(name && email && password){
      alert("Account created successfully");
      navigate("/login");
    }
    else{
      alert("Please fill all details");
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
          onChange={(e)=>setName(e.target.value)}
        />

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e)=>setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Create Password"
          value={password}
          onChange={(e)=>setPassword(e.target.value)}
        />

        <button type="submit">
          Sign In
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