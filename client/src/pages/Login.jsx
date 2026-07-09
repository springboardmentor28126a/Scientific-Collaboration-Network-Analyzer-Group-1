import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

function Login() {

    const navigate = useNavigate();

    const [loginData, setLoginData] = useState({
    email: "",
    password: ""
});

const [errors, setErrors] = useState({});
const [loading, setLoading] = useState(false);
const [showPassword, setShowPassword] = useState(false);
const [rememberMe, setRememberMe] = useState(false);
const [serverError, setServerError] = useState("");

    const handleChange = (e) => {

    const { name, value } = e.target;

    setLoginData({
        ...loginData,
        [name]: value
    });

    let newErrors = { ...errors };

    if (name === "email") {

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!value.trim()) {
            newErrors.email = "Email is required";
        } else if (!emailRegex.test(value.trim())) {
            newErrors.email = "Enter a valid email";
        } else {
            newErrors.email = "";
        }

    }

    if (name === "password") {

        if (!value) {
            newErrors.password = "Password is required";
        } else {
            newErrors.password = "";
        }

    }

    setErrors(newErrors);
    setServerError("");

};
    const validate = () => {

    let newErrors = {};

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!loginData.email.trim()) {

        newErrors.email = "Email is required";

    } else if (!emailRegex.test(loginData.email.trim())) {

        newErrors.email = "Enter a valid email";

    }

    if (!loginData.password) {

        newErrors.password = "Password is required";

    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;

};
    

    const handleLogin = async () => {
        if (!validate()) return;

setLoading(true);

        try {

            const response = await api.post(
                "/auth/login",
                loginData
            );

            localStorage.setItem(
                "token",
                response.data.access_token
            );

            localStorage.setItem(
                "user",
                JSON.stringify(response.data.user)
            );

            navigate("/dashboard");

        } catch (error) {

    if (error.response) {

        setServerError(error.response.data.detail);

    } else {

        setServerError("Login Failed");

    }

} finally {

    setLoading(false);

}

    };

   return (

<div
    style={{
        display: "flex",
        height: "100vh",
        background: "#f4f7fb",
        fontFamily: "Arial, sans-serif"
    }}
>

    {/* LEFT SIDE */}

    <div
        style={{
            flex: 1,
           background:
"linear-gradient(135deg,#1e3a8a,#2563eb,#60a5fa)" ,
            color: "white",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            padding: "70px"
        }}
    >
        <div
    style={{
        width: "70px",
        height: "70px",
        borderRadius: "50%",
        background: "rgba(255,255,255,.2)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        fontSize: "35px",
        marginBottom: "25px"
    }}
>

🔬

</div>
        <h1
            style={{
                fontSize: "45px",
                marginBottom: "10px"
            }}
        >
            🔬 Scientific Collaboration
        </h1>

        <h2>Network Analyzer</h2>

        <br />

        <h3>Collaborate.</h3>
        <h3>Publish.</h3>
        <h3>Innovate.</h3>

        <br />

        <p>✔ Secure Authentication</p>
        <p>✔ Publication Management</p>
        <p>✔ Collaboration Platform</p>
        <p>✔ Reviewer Dashboard</p>
<div
    style={{
        marginTop: "60px",
        fontSize: "15px",
        opacity: 0.9
    }}
>

    Empowering Researchers Worldwide 🌍

</div>
    </div>

    {/* RIGHT SIDE */}

    <div
        style={{
            flex: 1,
            display: "flex",
            justifyContent: "center",
            alignItems: "center"
        }}
    >

       <div
    style={{
        width: "420px",
        background: "rgba(255,255,255,0.95)",
        backdropFilter: "blur(10px)",
        padding: "40px",
        borderRadius: "25px",
        boxShadow: "0 20px 50px rgba(37,99,235,.20)",
        border: "1px solid rgba(255,255,255,.5)",
        transition: "0.3s"
    }}
>
        

            <h1
                style={{
                    textAlign: "center",
                    color: "#2563eb"
                }}
            >
                Welcome Back 👋
            </h1>

            <p
                style={{
                    textAlign: "center",
                    color: "#777",
                    marginBottom: "30px"
                }}
            >
                Login to continue
            </p>

            <label
    style={{
        fontWeight: "bold",
        color: "#333"
    }}
>
    Email
</label>

<input
    type="email"
    name="email"
    value={loginData.email}
    placeholder="Enter your email"
    onChange={handleChange}
    style={inputStyle}
/>

<small style={errorStyle}>
    {errors.email}
</small>

<label
    style={{
        fontWeight: "bold",
        color: "#333"
    }}
>
    Password
</label>

<div
    style={{
        display: "flex",
        alignItems: "center"
    }}
>

<input
    type={showPassword ? "text" : "password"}
    name="password"
    value={loginData.password}
    placeholder="Enter your password"
    onChange={handleChange}
    style={{
        ...inputStyle,
        marginBottom: 0
    }}
/>

<button
    type="button"
    onClick={() => setShowPassword(!showPassword)}
    style={{
        marginLeft: "10px",
        border: "none",
        background: "transparent",
        cursor: "pointer",
        fontSize: "22px"
    }}
>
    {showPassword ? "🙈" : "👁"}
</button>

</div>

<small style={errorStyle}>
    {errors.password}
</small>

<div
    style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginTop: "15px",
        marginBottom: "25px"
    }}
>

<label
    style={{
        cursor: "pointer"
    }}
>

<input
    type="checkbox"
    checked={rememberMe}
    onChange={() => setRememberMe(!rememberMe)}
/>

{" "}Remember Me

</label>

<span
    onClick={() => navigate("/forgot-password")}
    style={{
        color: "#2563eb",
        cursor: "pointer",
        fontWeight: "bold"
    }}
>

Forgot Password?

</span>

</div>

<button

    onClick={handleLogin}

    disabled={loading}

    style={{
    width: "100%",
    background: "linear-gradient(135deg,#2563eb,#3b82f6)",
    color: "white",
    border: "none",
    padding: "15px",
    borderRadius: "12px",
    cursor: "pointer",
    fontSize: "17px",
    fontWeight: "bold",
    transition: "0.3s",
    boxShadow: "0 8px 20px rgba(37,99,235,.35)"
}}

>

{loading ? "Signing In..." : "Login"}

</button>

<p
    style={{
        textAlign: "center",
        marginTop: "25px"
    }}
>

Don't have an account?

<span

    onClick={() => navigate("/register")}

    style={{

        color: "#2563eb",

        cursor: "pointer",

        fontWeight: "bold"

    }}

>

{" "}Create Account

</span>

</p>

<p
    style={{
        color: "red",
        textAlign: "center"
    }}
>

{serverError}

</p>

        </div>

    </div>

</div>

);
}
const inputStyle = {

    width: "100%",

    padding: "14px",

    marginTop: "8px",

    marginBottom: "8px",

    borderRadius: "12px",

    border: "1px solid #d1d5db",

    background: "#f9fafb",

    fontSize: "15px",

    transition: "0.3s",

    outline: "none",

    boxSizing: "border-box"

};

const errorStyle = {

    color: "#ef4444",

    fontSize: "12px",

    display: "block",

    marginBottom: "15px"

};

export default Login;