// NOTE:
// This is a starter Register.jsx template.
// It keeps your existing functionality and is structured so you can
// extend it with password strength, live validation, etc.

import { useCallback, useState } from "react";
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
import CaptchaWidget from "../components/CaptchaWidget";

const countries = ["India", "United States", "United Kingdom", "Canada", "Australia", "Germany", "France", "Japan", "Singapore", "United Arab Emirates", "South Africa", "Brazil", "China", "Other"];

export default function Register() {

    const navigate = useNavigate();

    const [formData, setFormData] = useState({

    name: "",

    email: "",

    password: "",

    confirmPassword: "",

    role: "Researcher",

    institution: "",

    department: "",

    research_interest: "",

    country: "India"

});

    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [serverError, setServerError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [captchaState, setCaptchaState] = useState({ captcha_verification: "", captcha: { required: true } });
    const [captchaReset, setCaptchaReset] = useState(0);
    const handleCaptchaChange = useCallback((value) => setCaptchaState(value), []);

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
        else if (formData.password.length < 8) {
            e.password = "Password must be at least 8 characters.";
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

    const handleSubmit = async (event) => {
        event?.preventDefault();

        if (!validate()) return;
        if (captchaState.captcha?.required && !captchaState.captcha_verification) {
            setServerError("Please complete and verify the CAPTCHA.");
            return;
        }

        try {

            setLoading(true);

            await api.post("/auth/register", {

    name: formData.name,

    email: formData.email,

    password: formData.password,
    confirm_password: formData.confirmPassword,
    captcha_verification: captchaState.captcha_verification,

    role: formData.role,

    institution: formData.institution,

    department: formData.department,

    research_interest: formData.research_interest,

    country: formData.country

});

            setSuccessMessage(
                "Registration Successful! Redirecting..."
            );

            setTimeout(() => {

                navigate("/");

            }, 2000);

        }

        catch (err) {

            if (err.response?.data?.detail) {
                const detail = err.response.data.detail;
                setServerError(detail === "CAPTCHA verification failed." ? "CAPTCHA verification failed. Please try again." : detail);
                if (detail.includes("CAPTCHA")) { setCaptchaState({ token: "", captcha: null, answer: "" }); setCaptchaReset((value) => value + 1); }

            }

            else {

                setServerError(
                    "Unable to create your account right now. Please try again."
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

                <form className="register-card" onSubmit={handleSubmit}>

                    <h2 className="register-heading">
                        Create Account
                    </h2>

                    <p className="register-subheading">
                        Join the Scientific Collaboration Platform
                    </p>

                    {/* NAME */}

                    <div className="form-group">

                        <label>Full Name <span aria-hidden="true">*</span></label>

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

                        <label>Email <span aria-hidden="true">*</span></label>

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

                        <label>Password <span aria-hidden="true">*</span></label>

                        <div className="input-wrapper">

                            <RiLockPasswordFill className="input-icon" />

                            <input
                                type={showPassword ? "text" : "password"}
                                name="password"
                                placeholder="Create password"
                                autoComplete="new-password"
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
                        <small>Password must be at least 8 characters.</small>

                    </div>

                    {/* CONFIRM PASSWORD */}

                    <div className="form-group">

                        <label>Confirm Password <span aria-hidden="true">*</span></label>

                        <div className="input-wrapper">

                            <RiLockPasswordFill className="input-icon" />

                            <input
                                type={showPassword ? "text" : "password"}
                                name="confirmPassword"
                                placeholder="Confirm password"
                                autoComplete="new-password"
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

                        <label>Role <span aria-hidden="true">*</span></label>

                        <div className="input-wrapper role-wrapper">

                            <FaUserGraduate className="input-icon" />

                            <select
                                name="role"
                                value={formData.role}
                                onChange={handleChange}
                                className="role-select"
                            >
                                <option value="Researcher">Researcher</option>
                                <option value="Reviewer">Reviewer</option>
                                <option value="Institution Admin">Institution Admin</option>
                                <option value="System Admin">System Admin</option>
                            </select>

                        </div> 

                    </div>
                    {/* PROFESSIONAL INFORMATION */}

<h3
    style={{
        marginTop: "25px",
        marginBottom: "15px",
        color: "#2563eb"
    }}
>
    Professional Information
</h3>

{/* Institution */}

<div className="form-group">

    <label>Institution</label>

    <div className="input-wrapper">

        <input
            type="text"
            name="institution"
            placeholder="Enter Institution"
            value={formData.institution}
            onChange={handleChange}
        />

    </div>

</div>

{/* Department */}

<div className="form-group">

    <label>Department</label>

    <div className="input-wrapper">

        <input
            type="text"
            name="department"
            placeholder="Enter Department"
            value={formData.department}
            onChange={handleChange}
        />

    </div>

</div>

{/* Research Interest */}

<div className="form-group">

    <label>Research Interest</label>

    <div className="input-wrapper">

        <input
            type="text"
            name="research_interest"
            placeholder="Machine Learning, AI..."
            value={formData.research_interest}
            onChange={handleChange}
        />

    </div>

</div>

{/* Country */}

<div className="form-group">

    <label>Country <span aria-hidden="true">*</span></label>

    <div className="input-wrapper">

        <select
            name="country"
            value={formData.country}
            onChange={handleChange}
        >
            {countries.map((country) => <option key={country} value={country}>{country}</option>)}
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
                    <div className="form-group">
                        <label>CAPTCHA {captchaState.captcha?.required && <span aria-hidden="true">*</span>}</label>
                        <CaptchaWidget key={captchaReset} resetSignal={captchaReset} onChange={handleCaptchaChange} />
                    </div>

                    <button

                        className="register-btn"

                        type="submit"

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

                </form>

            </div>

        </div>

    );

}
