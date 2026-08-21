import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getCurrentUser, loginUser } from "../api/auth";
import { useAuth } from "../hooks/useAuth";
import "../styles/auth.css";

export default function Login() {
    const [form, setForm] = useState({
        email: "",
        password: ""
    });

    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const { setUser } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const response = await loginUser(
                form.email,
                form.password
            );

            localStorage.setItem(
                "token",
                response.data.access_token
            );

            const profile = await getCurrentUser();

            setUser(profile.data);

            navigate("/dashboard");
        } catch (err) {
            const detail = err.response?.data?.detail;

            setError(
                typeof detail === "string"
                    ? detail
                    : "Login failed. Please check your credentials."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page login-page">

            <div className="auth-layout">

                {/* =================================================
                    LOGIN FORM
                    ================================================= */}

                <section className="auth-shell">

                    <div className="auth-copy-block">

                        <p className="auth-kicker">
                            Secure access
                        </p>

                        <h1 className="auth-title">
                            Welcome back.
                        </h1>

                        <p className="auth-subtitle">
                            Sign in to continue to your research workspace.
                        </p>

                    </div>


                    <form
                        onSubmit={handleSubmit}
                        className="auth-form"
                    >

                        {/* Email */}

                        <label className="auth-field">

                            <span>
                                Email address
                            </span>

                            <input
                                id="login-email"
                                type="email"
                                name="email"
                                placeholder="name@institution.edu"
                                value={form.email}
                                onChange={handleChange}
                                required
                                autoComplete="email"
                                className="auth-input"
                            />

                        </label>


                        {/* Password */}

                        <label className="auth-field">

                            <span>
                                Password
                            </span>

                            <input
                                id="login-password"
                                type="password"
                                name="password"
                                placeholder="Enter your password"
                                value={form.password}
                                onChange={handleChange}
                                required
                                autoComplete="current-password"
                                className="auth-input"
                            />

                        </label>


                        {/* Error */}

                        {error && (
                            <p
                                className="auth-error"
                                role="alert"
                            >
                                {error}
                            </p>
                        )}


                        {/* Button */}

                        <div className="auth-actions">

                            <button
                                id="login-submit"
                                type="submit"
                                disabled={loading}
                                className="auth-button"
                            >
                                {loading
                                    ? "Signing in..."
                                    : "Sign in"}
                            </button>

                            <p className="auth-footer">
                                Don't have an account?{" "}
                                <Link to="/register">
                                    Create an account
                                </Link>
                            </p>

                        </div>

                    </form>

                </section>


                {/* =================================================
                    BRAND / VISUAL PANEL
                    ================================================= */}

                <aside className="auth-panel">

                    {/* Brand */}

                    <div className="auth-brand">

                        <div className="auth-brand-mark">
                            SN
                        </div>

                        <span className="auth-brand-name">
                            Scientific Collaboration
                        </span>

                    </div>


                    {/* Abstract Network */}

                    <div className="auth-network-visual">

                        <div className="auth-node" />
                        <div className="auth-node" />
                        <div className="auth-node" />
                        <div className="auth-node" />
                        <div className="auth-node" />

                    </div>


                    {/* Brand Content */}

                    <div className="auth-panel-content">

                        <div className="auth-panel-label">
                            Research intelligence platform
                        </div>

                        <h2 className="auth-panel-title">
                            Connect research.
                            <br />
                            Discover collaboration.
                        </h2>

                        <p className="auth-panel-copy">
                            A unified workspace for researchers,
                            institutions and publications.
                        </p>

                        <div className="auth-panel-meta">

                            <span>Research</span>
                            <span>Networks</span>
                            <span>Publications</span>

                        </div>

                    </div>

                </aside>

            </div>

        </div>
    );
}