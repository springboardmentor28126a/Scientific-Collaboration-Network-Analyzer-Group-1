import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { setAuthItem, setAuthUser } from "../utils/authStorage";

import {
    FaMicroscope,
    FaEye,
    FaEyeSlash,
    FaCheckCircle,
    FaUserGraduate,
    FaBook,
    FaShieldAlt
} from "react-icons/fa";

import {
    MdEmail
} from "react-icons/md";

import {
    RiLockPasswordFill
} from "react-icons/ri";

import "./Login.css";

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

                newErrors.email = "Please enter a valid email";

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

            newErrors.email = "Please enter a valid email";

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

        setAuthItem("token", response.data.access_token);
        setAuthUser(response.data.user);

        const user = response.data.user;

        // Confirm the document state from the verification table. This keeps
        // an old/stale user-table value of "Pending" from blocking a user
        // who has never submitted a document.
        let verificationStatus = user.verification_status;
        let isVerified = user.is_verified;

        if (user.role !== "System Admin" && !isVerified) {
            try {
                const statusResponse = await api.get("/verification/status");
                verificationStatus = statusResponse.data.status;
                isVerified = statusResponse.data.verified === true;

                user.verification_status = verificationStatus;
                user.is_verified = isVerified;
                setAuthUser(user);
            } catch {
                // Keep the login response as a fallback if status checking
                // is temporarily unavailable.
            }
        }

        // System Admin
        if (user.role === "System Admin") {

            navigate("/dashboard");

        }

        // Verified User
        else if (isVerified || verificationStatus === "Approved") {

            navigate("/dashboard");

        }

        // Pending Verification
        else if (verificationStatus === "Pending") {

            navigate("/verification-pending");

        }

        // Rejected Verification
        else if (verificationStatus === "Rejected") {

            navigate("/verification");

        }

        // Not Submitted
        else {

            navigate("/verification");

        }

    }

    catch (error) {

        if (error.response) {

            setServerError(error.response.data.detail);

        }

        else {

            setServerError("Login Failed");

        }

    }

    finally {

        setLoading(false);

    }

};

    return (

        <div className="login-container">

            {/* LEFT PANEL */}

            <div className="login-left">

                <div className="logo-circle">
                    <FaMicroscope />
                </div>

                <h1 className="project-title">
                    Scientific Collaboration
                    <br />
                    Network Analyzer
                </h1>

                <p className="project-subtitle">
                    Collaborate. Publish. Innovate.
                </p>

                <div className="feature-list">

                    <div className="feature-item">
                        <FaCheckCircle className="feature-icon" />
                        <span>Secure Authentication</span>
                    </div>

                    <div className="feature-item">
                        <FaBook className="feature-icon" />
                        <span>Publication Management</span>
                    </div>

                    <div className="feature-item">
                        <FaUserGraduate className="feature-icon" />
                        <span>Collaboration Platform</span>
                    </div>

                    <div className="feature-item">
                        <FaShieldAlt className="feature-icon" />
                        <span>Reviewer Dashboard</span>
                    </div>

                </div>

                <div className="left-footer">
                    Empowering Researchers Worldwide
                </div>

            </div>

            {/* RIGHT PANEL */}

            <div className="login-right">

                <div className="login-card">

                    <h2 className="login-heading">
                        Welcome Back
                    </h2>

                    <p className="login-subheading">
                        Login to continue your research journey
                    </p>

                    <div className="form-group">

                        <label>Email</label>

                        <div className="input-wrapper">

                            <MdEmail className="input-icon" />

                            <input
                                type="email"
                                name="email"
                                placeholder="Enter your email"
                                value={loginData.email}
                                onChange={handleChange}
                            />

                        </div>

                        {errors.email &&
                            <small className="error-text">
                                {errors.email}
                            </small>
                        }

                    </div>

                    <div className="form-group">

                        <label>Password</label>

                        <div className="input-wrapper">

                            <RiLockPasswordFill className="input-icon" />

                            <input
                                type={showPassword ? "text" : "password"}
                                name="password"
                                placeholder="Enter your password"
                                value={loginData.password}
                                onChange={handleChange}
                            />

                            <button
                                className="eye-btn"
                                type="button"
                                onClick={() =>
                                    setShowPassword(!showPassword)
                                }
                            >

                                {
                                    showPassword
                                        ? <FaEyeSlash />
                                        : <FaEye />
                                }

                            </button>

                        </div>

                        {errors.password &&
                            <small className="error-text">
                                {errors.password}
                            </small>
                        }

                    </div>

                    <div className="remember-row">

                        <label className="remember-label">

                            <input
                                type="checkbox"
                                checked={rememberMe}
                                onChange={() =>
                                    setRememberMe(!rememberMe)
                                }
                            />

                            <span>Remember Me</span>

                        </label>

                        <span
                            className="forgot-link"
                            onClick={() => navigate("/forgot-password")}
                        >
                            Forgot Password?
                        </span>

                    </div>

                    <button
                        className="login-btn"
                        onClick={handleLogin}
                        disabled={loading}
                    >

                        {
                            loading
                                ? "Signing In..."
                                : "Login"
                        }

                    </button>

                    {
                        serverError &&

                        <p className="server-error">

                            {serverError}

                        </p>

                    }

                    <p className="register-text">

                        Don't have an account?

                        <span
                            className="register-link"
                            onClick={() => navigate("/register")}
                        >

                            Create Account

                        </span>

                    </p>

                </div>

            </div>

        </div>

    );

}

export default Login;
