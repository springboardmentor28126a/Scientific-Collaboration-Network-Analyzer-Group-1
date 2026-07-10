// NOTE:
// This is a starter Register.jsx template.
// It keeps your existing functionality and is structured so you can
// extend it with password strength, live validation, etc.

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

import {
    FaMicroscope,
    FaUserGraduate,
    FaBook,
    FaShieldAlt,
    FaUser,
    FaEye,
    FaEyeSlash
} from "react-icons/fa";

import { MdEmail } from "react-icons/md";
import { RiLockPasswordFill } from "react-icons/ri";

import "./Register.css";

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
    const [successMessage, setSuccessMessage] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    const validate = () => {

        const e = {};

        if (!formData.name.trim()) {
            e.name = "Full name is required";
        }
        else if (formData.name.trim().length < 3) {
            e.name = "Name must contain at least 3 characters";
        }
        else if (!/^[A-Za-z ]+$/.test(formData.name)) {
            e.name = "Only letters and spaces are allowed";
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!formData.email.trim()) {
            e.email = "Email is required";
        }
        else if (!emailRegex.test(formData.email.trim())) {
            e.email = "Please enter a valid email";
        }

        if (!formData.password) {
            e.password = "Password is required";
        }

        if (!formData.confirmPassword) {
            e.confirmPassword = "Confirm password is required";
        }
        else if (formData.password !== formData.confirmPassword) {
            e.confirmPassword = "Passwords do not match";
        }

        setErrors(e);

        return Object.keys(e).length === 0;

    };

    const handleChange = (e) => {

        const { name, value } = e.target;

        const updatedForm = {
            ...formData,
            [name]: value
        };

        setFormData(updatedForm);

        let newErrors = { ...errors };

        if (name === "email") {

            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

            if (!value.trim()) {
                newErrors.email = "Email is required";
            }
            else if (!emailRegex.test(value.trim())) {
                newErrors.email = "Please enter a valid email";
            }
            else {
                newErrors.email = "";
            }

        }

        if (updatedForm.confirmPassword) {

            if (updatedForm.password !== updatedForm.confirmPassword) {
                newErrors.confirmPassword = "Passwords do not match";
            }
            else {
                newErrors.confirmPassword = "";
            }

        }

        setErrors(newErrors);
        setServerError("");

    };

    const handleSubmit = async () => {

        if (!validate()) return;

        try {

            setLoading(true);

            await api.post("/auth/register", {

                name: formData.name,
                email: formData.email,
                password: formData.password,
                role: formData.role

            });

            setSuccessMessage(
                "Registration Successful! Redirecting..."
            );

            setTimeout(() => {

                navigate("/");

            }, 2000);

        }

        catch (err) {

            if (err.response?.status === 400) {

                setServerError(err.response.data.detail);

            }

            else {

                setServerError(
                    "Something went wrong. Please try again."
                );

            }

        }

        finally {

            setLoading(false);

        }

    };

    return (

        <div className="register-container">

            {/* LEFT PANEL */}

            <div className="register-left">

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
                        <FaShieldAlt />
                        <span>Secure Authentication</span>
                    </div>

                    <div className="feature-item">
                        <FaBook />
                        <span>Publication Management</span>
                    </div>

                    <div className="feature-item">
                        <FaUserGraduate />
                        <span>Research Collaboration</span>
                    </div>

                    <div className="feature-item">
                        <FaShieldAlt />
                        <span>Reviewer Dashboard</span>
                    </div>

                </div>

                <p className="footer-text">
                    Empowering Researchers Worldwide
                </p>

            </div>

            {/* RIGHT PANEL */}

            <div className="register-right">

                <div className="register-card">

                    <h2 className="register-heading">
                        Create Account
                    </h2>

                    <p className="register-subheading">
                        Join the Scientific Collaboration Platform
                    </p>

                    {/* NAME */}

                    <div className="form-group">

                        <label>Full Name</label>

                        <div className="input-wrapper">

                            <FaUser className="input-icon" />

                            <input
                                type="text"
                                name="name"
                                placeholder="Enter your full name"
                                value={formData.name}
                                onChange={handleChange}
                            />

                        </div>

                        {errors.name &&
                            <small className="error-text">
                                {errors.name}
                            </small>
                        }

                    </div>

                    {/* EMAIL */}

                    <div className="form-group">

                        <label>Email</label>

                        <div className="input-wrapper">

                            <MdEmail className="input-icon" />

                            <input
                                type="email"
                                name="email"
                                placeholder="Enter your email"
                                value={formData.email}
                                onChange={handleChange}
                            />

                        </div>

                        {errors.email &&
                            <small className="error-text">
                                {errors.email}
                            </small>
                        }

                    </div>

                    {/* PASSWORD */}

                    <div className="form-group">

                        <label>Password</label>

                        <div className="input-wrapper">

                            <RiLockPasswordFill className="input-icon" />

                            <input
                                type={showPassword ? "text" : "password"}
                                name="password"
                                placeholder="Create password"
                                value={formData.password}
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

                    {/* CONFIRM PASSWORD */}

                    <div className="form-group">

                        <label>Confirm Password</label>

                        <div className="input-wrapper">

                            <RiLockPasswordFill className="input-icon" />

                            <input
                                type={showPassword ? "text" : "password"}
                                name="confirmPassword"
                                placeholder="Confirm password"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                            />

                        </div>

                        {errors.confirmPassword
                            ?

                            <small className="error-text">

                                {errors.confirmPassword}

                            </small>

                            :

                            formData.confirmPassword &&
                                formData.password === formData.confirmPassword

                                ?

                                <small className="success-text">

                                    Passwords Match

                                </small>

                                :

                                null}

                    </div>
                    {/* ROLE */}
                    <div className="form-group">

                        <label>Role</label>

                        <div className="input-wrapper role-wrapper">

                            <FaUserGraduate className="input-icon" />

                            <select
                                name="role"
                                value={formData.role}
                                onChange={handleChange}
                                className="role-select"
                            >
                                <option value="Researcher">Researcher</option>
                                <option value="Institution Admin">Institution Admin</option>
                                <option value="Reviewer">Reviewer</option>
                                <option value="System Admin">System Admin</option>
                            </select>

                        </div>

                    </div>
                    {/* SUCCESS */}

                    {
                        successMessage &&

                        <div className="message success">

                            {successMessage}

                        </div>

                    }

                    {/* REGISTER BUTTON */}

                    <button

                        className="register-btn"

                        onClick={handleSubmit}

                        disabled={
                            loading ||
                            !formData.name.trim() ||
                            !formData.email.trim() ||
                            !formData.password ||
                            !formData.confirmPassword ||
                            Object.keys(errors).some(
                                key => errors[key]
                            )
                        }

                    >

                        {
                            loading
                                ? "Creating Account..."
                                : "Create Account"
                        }

                    </button>

                    {/* SERVER ERROR */}

                    {

                        serverError &&

                        <div className="message error">

                            {serverError}

                        </div>

                    }

                    {/* LOGIN */}

                    <p className="login-link">

                        Already have an account?

                        <span
                            onClick={() => navigate("/")}
                        >

                            {" "}Sign In

                        </span>

                    </p>

                </div>

            </div>

        </div>

    );

}