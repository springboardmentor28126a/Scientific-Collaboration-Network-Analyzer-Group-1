// NOTE:
// This is a starter Register.jsx template.
// It keeps your existing functionality and is structured so you can
// extend it with password strength, live validation, etc.

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

export default function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "Researcher",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const passwordChecks = {
    length: formData.password.length >= 8,
    upper: /[A-Z]/.test(formData.password),
    lower: /[a-z]/.test(formData.password),
    number: /\d/.test(formData.password),
    special: /[@$!%*?&]/.test(formData.password),
  };

  const score = Object.values(passwordChecks).filter(Boolean).length;
  const strength =
    score <= 2 ? "Weak" : score <= 4 ? "Medium" : "Strong";

const validate = () => {

    const e = {};

    // Name
    if (!formData.name.trim()) {
        e.name = "Full name is required";
    } else if (formData.name.trim().length < 3) {
        e.name = "Name must contain at least 3 characters";
    } else if (!/^[A-Za-z ]+$/.test(formData.name)) {
        e.name = "Only letters and spaces are allowed";
    }

    // Email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!formData.email.trim()) {
        e.email = "Email is required";
    } else if (!emailRegex.test(formData.email.trim())) {
        e.email = "Please enter a valid email address";
    }

    // Password
    if (!formData.password) {
        e.password = "Password is required";
    } else if (score < 5) {
        e.password = "Use a stronger password";
    }

    // Confirm Password
    if (!formData.confirmPassword) {
        e.confirmPassword = "Confirm password is required";
    } else if (formData.password !== formData.confirmPassword) {
        e.confirmPassword = "Passwords do not match";
    }

    setErrors(e);

    return Object.keys(e).length === 0;
};

 const handleChange = (e) => {

  const { name, value } = e.target;

  setFormData({
    ...formData,
    [name]: value,
  });

  let newErrors = { ...errors };

  if (name === "email") {

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!value.trim()) {
      newErrors.email = "Email is required";
    } else if (!emailRegex.test(value.trim())) {
      newErrors.email = "Enter a valid email address";
    } else {
      newErrors.email = "";
    }
  }
  // Live Confirm Password Validation
if (name === "password" || name === "confirmPassword") {

    if (
        updatedForm.confirmPassword &&
        updatedForm.password !== updatedForm.confirmPassword
    ) {
        newErrors.confirmPassword = "Passwords do not match";
    } else {
        newErrors.confirmPassword = "";
    }

}
  setErrors(newErrors);
  setServerError("");
};
    const generatePassword = () => {

    const chars =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@$!%*?&";

    let password = "";

    for (let i = 0; i < 12; i++) {
        password += chars.charAt(
            Math.floor(Math.random() * chars.length)
        );
    }

    setFormData({
        ...formData,
        password: password,
        confirmPassword: password
    });

};
  const handleSubmit = async () => {
    if (!validate()) return;

    try {
      setLoading(true);

      await api.post("/auth/register", {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role,
      });

      alert("Registration successful");
      navigate("/");
    } catch (err) {

    if (err.response?.status === 400) {
        setServerError(err.response.data.detail);
    } else {
        setServerError("Something went wrong. Please try again.");
    }

} finally {

    setLoading(false);

}
  };

  return (
    <div style={{
      minHeight:"100vh",
      display:"flex",
      justifyContent:"center",
      alignItems:"center",
      background:"linear-gradient(135deg,#2563eb,#60a5fa)"
    }}>
      <div style={{
        width:430,
        background:"#fff",
        padding:30,
        borderRadius:14,
        boxShadow:"0 15px 40px rgba(0,0,0,.2)"
      }}>
        <h2 style={{textAlign:"center"}}>Create Account</h2>

        <input
    name="name"
    placeholder="Full Name"
    value={formData.name}
    onChange={handleChange}
    style={{
        width:"100%",
        padding:10,
        marginTop:10,
        border:
            errors.name
                ? "2px solid red"
                : formData.name
                ? "2px solid green"
                : "1px solid #ccc",
        borderRadius:"6px"
    }}
/>
        <small style={{color:"red"}}>{errors.name}</small>

        <input name="email" type="email" placeholder="Email"
          value={formData.email}
          onChange={handleChange} style={{
    width:"100%",
    padding:10,
    marginTop:10,
    border:
        errors.email
            ? "2px solid red"
            : formData.email
            ? "2px solid green"
            : "1px solid #ccc",
    borderRadius:"6px"
}}/>
        <small style={{color:"red"}}>{errors.email}</small>

        <input
          type={showPassword?"text":"password"}
          name="password"
          placeholder="Min. 8 chars, Aa, 1, @"
          value={formData.password}
          onChange={handleChange}
          style={{
    width:"100%",
    padding:10,
    marginTop:10,
    border:
        errors.password
            ? "2px solid red"
            : formData.password
            ? "2px solid green"
            : "1px solid #ccc",
    borderRadius:"6px"
}}
        />
        <button
  type="button"
  onClick={generatePassword}
  style={{
    marginTop: "10px",
    marginBottom: "10px",
    background: "#2563eb",
    color: "white",
    border: "none",
    padding: "8px 12px",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: "bold"
  }}
>
  🔑 Generate Strong Password
</button>

        <button
    type="button"
    onClick={() => setShowPassword(!showPassword)}
    style={{
        marginLeft: "10px",
        background: "transparent",
        border: "none",
        cursor: "pointer",
        fontSize: "20px",
        color: "#2563eb"
    }}
>
    {showPassword ? "🙈" : "👁"}
</button>

        <div style={{marginTop:10}}>
          <b
  style={{
    color:
      strength === "Weak"
        ? "red"
        : strength === "Medium"
        ? "orange"
        : "green"
  }}
>
  Password Strength: {strength}
</b>
         
        </div>
        <div style={{ marginTop: 10 }}>

  <b
    style={{
      color:
        strength === "Weak"
          ? "red"
          : strength === "Medium"
          ? "orange"
          : "green"
    }}
  >
    
  </b>

  {/* Progress Bar */}
  <div
    style={{
      width: "100%",
      height: "8px",
      background: "#ddd",
      borderRadius: "10px",
      marginTop: "8px",
      marginBottom: "12px"
    }}
  >
    <div
      style={{
        width: `${score * 20}%`,
        height: "100%",
        background:
          strength === "Weak"
            ? "red"
            : strength === "Medium"
            ? "orange"
            : "green",
        borderRadius: "10px",
        transition: "0.3s"
      }}
    ></div>
  </div>

  <ul style={{ paddingLeft: "20px" }}>
    <li>{passwordChecks.length ? "✅" : "❌"} 8+ characters</li>
    <li>{passwordChecks.upper ? "✅" : "❌"} Uppercase</li>
    <li>{passwordChecks.lower ? "✅" : "❌"} Lowercase</li>
    <li>{passwordChecks.number ? "✅" : "❌"} Number</li>
    <li>{passwordChecks.special ? "✅" : "❌"} Special character</li>
  </ul>

</div>

        {
errors.confirmPassword ?

<small style={{color:"red"}}>
❌ {errors.confirmPassword}
</small>

:

formData.confirmPassword &&
formData.password===formData.confirmPassword ?

<small
style={{
color:"green",
fontWeight:"bold"
}}
>
✅ Passwords Match
</small>

:

null
}

        <input
          type={showPassword?"text":"password"}
          name="confirmPassword"
          placeholder="Confirm Password"
          value={formData.confirmPassword}
          onChange={handleChange}
          style={{
    width:"100%",
    padding:10,
    marginTop:10,
    border:
        errors.confirmPassword
            ? "2px solid red"
            : formData.confirmPassword &&
              formData.password === formData.confirmPassword
            ? "2px solid green"
            : "1px solid #ccc",
    borderRadius:"6px"
}}
        />
        <small style={{color:"red"}}>{errors.confirmPassword}</small>

        <select
          name="role"
          value={formData.role}
          onChange={handleChange}
          style={{width:"100%",padding:10,marginTop:10}}>
          <option>Researcher</option>
          <option>Institution Admin</option>
          <option>Reviewer</option>
          <option>System Admin</option>
        </select>

        <button
  disabled={
    loading ||
    !formData.name.trim() ||
    !formData.email.trim() ||
    !formData.password ||
    !formData.confirmPassword ||
    Object.keys(errors).some((key) => errors[key])
  }
  onClick={handleSubmit}
          style={{
    width:"100%",
    marginTop:20,
    padding:"12px",
    background:
        loading ||
        !formData.name.trim() ||
        !formData.email.trim() ||
        !formData.password ||
        !formData.confirmPassword ||
        Object.keys(errors).some((key) => errors[key])
            ? "#94a3b8"
            : "#2563eb",
    color:"#fff",
    border:"none",
    borderRadius:"8px",
    cursor:
        loading ||
        Object.keys(errors).some((key) => errors[key])
            ? "not-allowed"
            : "pointer",
    transition:"0.3s"
}}>
          {loading?"Registering...":"Register"}
        </button>

        <p style={{color:"red"}}>{serverError}</p>

      </div>
    </div>
  );
}
