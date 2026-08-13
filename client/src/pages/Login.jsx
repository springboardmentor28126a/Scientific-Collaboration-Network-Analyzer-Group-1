import { useCallback, useEffect, useState } from "react";
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
import CaptchaWidget from "../components/CaptchaWidget";

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
    const [authMode, setAuthMode] = useState("password");
    const [otp, setOtp] = useState("");
    const [captchaState, setCaptchaState] = useState({ token: "", captcha: null, answer: "" });
    const [captchaReset, setCaptchaReset] = useState(0);
    const [mfaCode, setMfaCode] = useState("");
    const [otpSent, setOtpSent] = useState(false);
    const [resendSeconds, setResendSeconds] = useState(0);

    const handleCaptchaChange = useCallback((value) => setCaptchaState(value), []);
    useEffect(() => { if (!resendSeconds) return undefined; const timer = setInterval(() => setResendSeconds((value) => Math.max(0, value - 1)), 1000); return () => clearInterval(timer); }, [resendSeconds]);

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

const handleLogin = async (event) => {
    event?.preventDefault();

    if (!validate()) return;
    if (captchaState.captcha?.required && !captchaState.token && !captchaState.answer) {
        setServerError("Please complete the CAPTCHA.");
        return;
    }

    setLoading(true);

    try {

        const response = await api.post("/auth/login", { ...loginData, captcha_token: captchaState.token, captcha_id: captchaState.captcha?.captcha_id, captcha_answer: captchaState.answer, mfa_code: mfaCode || undefined });

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
            const detail = error.response.data.detail;
            setServerError(detail === "CAPTCHA verification failed." ? "CAPTCHA verification failed. Please try again." : "Unable to sign in with those credentials.");
            if (detail?.includes("CAPTCHA")) { setCaptchaState({ token: "", captcha: null, answer: "" }); setCaptchaReset((value) => value + 1); }

        }

        else {

            setServerError("Unable to sign in right now. Please try again.");

        }

    }

    finally {

        setLoading(false);

    }

    };

    const requestOtp = async () => {
        if (!loginData.email.trim()) { setServerError("Enter your email first."); return; }
        if (captchaState.captcha?.required && !captchaState.token && !captchaState.answer) { setServerError("Please complete the CAPTCHA."); return; }
        setLoading(true);
        try {
            await api.post("/auth/request-otp", { email: loginData.email, captcha_token: captchaState.token, captcha_id: captchaState.captcha?.captcha_id, captcha_answer: captchaState.answer });
            setOtpSent(true); setResendSeconds(60); setCaptchaState({ token: "", captcha: null, answer: "" }); setCaptchaReset((value) => value + 1);
            setServerError("If the account is eligible, a sign-in code has been sent.");
        } catch (error) { setServerError(error.response?.data?.detail === "CAPTCHA verification failed." ? "CAPTCHA verification failed. Please try again." : "Unable to send sign-in code."); setCaptchaState({ token: "", captcha: null, answer: "" }); setCaptchaReset((value) => value + 1); }
        finally { setLoading(false); }
    };

    const verifyOtp = async () => {
        if (!otp.trim()) { setServerError("Enter the verification code from your email."); return; }
        setLoading(true);
        try {
            const response = await api.post("/auth/verify-otp", { email: loginData.email, code: otp, captcha_token: captchaState.token });
            setAuthItem("token", response.data.access_token); setAuthUser(response.data.user); navigate("/dashboard");
        } catch { setServerError("That code is invalid or has expired. Please request a new code."); }
        finally { setLoading(false); }
    };

    const switchAuthMode = (mode) => {
        setAuthMode(mode);
        setOtpSent(false);
        setOtp("");
        setServerError("");
        setErrors({});
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

                <form className="login-card" onSubmit={handleLogin}>

                    <h2 className="login-heading">
                        Welcome back
                    </h2>

                    <p className="login-subheading">
                        Sign in to your SCNA account
                    </p>

                    <div className="auth-switch" role="tablist" aria-label="Sign-in method">
                        <button type="button" role="tab" aria-selected={authMode === "password"} className={authMode === "password" ? "auth-tab active" : "auth-tab"} onClick={() => switchAuthMode("password")}>Password</button>
                        <button type="button" role="tab" aria-selected={authMode === "otp"} className={authMode === "otp" ? "auth-tab active" : "auth-tab"} onClick={() => switchAuthMode("otp")}>Email OTP</button>
                    </div>

                    <div className="form-group">

                        <label>Email</label>

                        <div className="input-wrapper">

                            <MdEmail className="input-icon" />

                            <input
                                type="email"
                                name="email"
                                placeholder="Enter your email"
                                autoComplete="email"
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

                    <div className="form-group"><label>CAPTCHA</label><CaptchaWidget key={captchaReset} resetSignal={captchaReset} onChange={handleCaptchaChange} /></div>

                    {authMode === "password" && loginData.password && (
                        <div className="form-group"><label>MFA code (if enabled)</label><input inputMode="numeric" maxLength="6" value={mfaCode} onChange={(event) => setMfaCode(event.target.value)} placeholder="Authenticator code" /></div>
                    )}

                    {authMode === "otp" && !otpSent && <button className="login-btn" type="button" onClick={requestOtp} disabled={loading}>{loading ? "Sending code..." : "Send OTP"}</button>}
                    {authMode === "otp" && otpSent && <div className="otp-step"><h3>Check your email</h3><p className="otp-message">We've sent a verification code to your email.</p><div className="form-group"><label htmlFor="email-otp">Verification code</label><input id="email-otp" inputMode="numeric" maxLength="6" value={otp} onChange={(event) => setOtp(event.target.value)} placeholder="Enter 6-digit code" autoComplete="one-time-code" /></div><button className="login-btn" type="button" onClick={verifyOtp} disabled={loading}>{loading ? "Verifying..." : "Verify OTP"}</button><button className="text-button" type="button" onClick={requestOtp} disabled={resendSeconds > 0 || loading}>{resendSeconds > 0 ? `Resend available in ${resendSeconds}s` : "Resend code"}</button><button className="back-button" type="button" onClick={() => setOtpSent(false)}>Use a different email</button></div>}

                    {authMode === "password" && <div className="form-group">

                        <label>Password</label>

                        <div className="input-wrapper">

                            <RiLockPasswordFill className="input-icon" />

                            <input
                                type={showPassword ? "text" : "password"}
                                name="password"
                                placeholder="Enter your password"
                                autoComplete="current-password"
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

                    </div>}

                    {authMode === "password" && <div className="remember-row">

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

                    </div>}

                    {authMode === "password" && <button
                        className="login-btn"
                        type="submit"
                        disabled={loading}
                    >

                        {
                            loading
                                ? "Signing in..."
                                : "Sign In"
                        }

                    </button>}

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

                </form>

            </div>

        </div>

    );

}

export default Login;
