import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import "./Register.css";

function Register() {
    const navigate = useNavigate();

    // =========================
    // FORM STATE
    // =========================

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    // =========================
    // HANDLE INPUT
    // =========================

    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData((previous) => ({
            ...previous,
            [name]: value,
        }));

        setError("");
        setSuccess("");
    };

    // =========================
    // REGISTER USER
    // =========================

    const handleRegister = async (e) => {
        e.preventDefault();

        setError("");
        setSuccess("");

        // Validate name
        if (!formData.name.trim()) {
            setError("Please enter your name.");
            return;
        }

        // Validate email
        if (!formData.email.trim()) {
            setError("Please enter your email.");
            return;
        }

        // Validate password
        if (!formData.password) {
            setError("Please enter a password.");
            return;
        }

        // Password length
        if (formData.password.length < 6) {
            setError(
                "Password must be at least 6 characters."
            );
            return;
        }

        // Confirm password
        if (
            formData.password !==
            formData.confirmPassword
        ) {
            setError(
                "Passwords do not match."
            );
            return;
        }

        try {
            setLoading(true);

            console.log(
                "REGISTER DATA:",
                {
                    name: formData.name,
                    email: formData.email,
                }
            );

            // =========================
            // API REQUEST
            // =========================

            const response = await api.post(
                "/auth/register",
                {
                    name: formData.name.trim(),
                    email: formData.email.trim(),
                    password: formData.password,
                }
            );

            console.log(
                "REGISTER RESPONSE:",
                response.data
            );

            setSuccess(
                "Account created successfully! 🎉"
            );

            // Clear form
            setFormData({
                name: "",
                email: "",
                password: "",
                confirmPassword: "",
            });

            // Redirect to login
            setTimeout(() => {
                navigate("/login");
            }, 1500);

        } catch (error) {

            console.error(
                "REGISTER ERROR:",
                error.response?.data ||
                error.message
            );

            setError(
                error.response?.data?.message ||
                "Registration failed. Please try again."
            );

        } finally {
            setLoading(false);
        }
    };

    // =========================
    // PAGE
    // =========================

    return (
        <div className="register-page">

            <div className="register-card">

                {/* =========================
                    LOGO
                ========================= */}

                <div className="register-logo">

                    <div className="register-logo-icon">
                        🚀
                    </div>

                    <h1>
                        TaskFlow AI
                    </h1>

                </div>


                {/* =========================
                    TITLE
                ========================= */}

                <div className="register-title">

                    <h2>
                        Create Account
                    </h2>

                    <p>
                        Join TaskFlow AI and manage
                        your projects efficiently.
                    </p>

                </div>


                {/* =========================
                    ERROR
                ========================= */}

                {error && (

                    <div className="register-error">
                        ⚠️ {error}
                    </div>

                )}


                {/* =========================
                    SUCCESS
                ========================= */}

                {success && (

                    <div className="register-success">
                        ✅ {success}
                    </div>

                )}


                {/* =========================
                    FORM
                ========================= */}

                <form
                    onSubmit={handleRegister}
                    className="register-form"
                >

                    {/* NAME */}

                    <div className="register-field">

                        <label htmlFor="name">
                            Full Name
                        </label>

                        <input
                            id="name"
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="Enter your name"
                            autoComplete="name"
                            required
                        />

                    </div>


                    {/* EMAIL */}

                    <div className="register-field">

                        <label htmlFor="email">
                            Email
                        </label>

                        <input
                            id="email"
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="Enter your email"
                            autoComplete="email"
                            required
                        />

                    </div>


                    {/* PASSWORD */}

                    <div className="register-field">

                        <label htmlFor="password">
                            Password
                        </label>

                        <input
                            id="password"
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="Enter password"
                            autoComplete="new-password"
                            required
                        />

                    </div>


                    {/* CONFIRM PASSWORD */}

                    <div className="register-field">

                        <label htmlFor="confirmPassword">
                            Confirm Password
                        </label>

                        <input
                            id="confirmPassword"
                            type="password"
                            name="confirmPassword"
                            value={
                                formData.confirmPassword
                            }
                            onChange={handleChange}
                            placeholder="Confirm your password"
                            autoComplete="new-password"
                            required
                        />

                    </div>


                    {/* REGISTER BUTTON */}

                    <button
                        type="submit"
                        className="register-button"
                        disabled={loading}
                    >

                        {loading
                            ? "Creating Account..."
                            : "Create Account"
                        }

                    </button>

                </form>


                {/* =========================
                    LOGIN LINK
                ========================= */}

                <div className="login-link">

                    <span>
                        Already have an account?
                    </span>

                    <button
                        type="button"
                        onClick={() =>
                            navigate("/login")
                        }
                    >
                        Login
                    </button>

                </div>

            </div>

        </div>
    );
}

export default Register;