import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const navigate = useNavigate();

    // ==========================================
    // HANDLE LOGIN
    // ==========================================

    const handleLogin = async (e) => {
        e.preventDefault();

        setError("");
        setLoading(true);

        try {
            console.log("=================================");
            console.log("🔐 LOGIN START");
            console.log("=================================");

            console.log("Email:", email);

            // ==========================================
            // REMOVE OLD LOGIN DATA
            // ==========================================

            localStorage.removeItem("token");
            localStorage.removeItem("user");
            localStorage.removeItem("userId");

            console.log("🧹 Old login data removed");

            // ==========================================
            // SEND LOGIN REQUEST
            // ==========================================

            console.log("📤 Sending login request...");

            const response = await api.post("/auth/login", {
                email,
                password
            });

            // ==========================================
            // LOGIN RESPONSE
            // ==========================================

            console.log("📥 Login request completed");
            console.log("HTTP STATUS:", response.status);
            console.log("LOGIN RESPONSE:", response.data);

            // ==========================================
            // GET TOKEN
            // ==========================================

            const token = response.data?.token;

            console.log("TOKEN RECEIVED:", !!token);

            // ==========================================
            // GET USER
            // ==========================================

            const user = response.data?.user;

            console.log("USER RECEIVED:", user);

            // ==========================================
            // CHECK TOKEN
            // ==========================================

            if (!token) {
                console.error("❌ TOKEN NOT RECEIVED");

                setError(
                    "Login failed: token was not received from server."
                );

                return;
            }

            // ==========================================
            // CHECK USER
            // ==========================================

            if (!user) {
                console.error("❌ USER NOT RECEIVED");

                setError(
                    "Login failed: user information was not received."
                );

                return;
            }

            // ==========================================
            // CHECK USER ID
            // ==========================================

            if (!user._id) {
                console.error("❌ USER ID NOT RECEIVED");
                console.error("USER OBJECT:", user);

                setError(
                    "Login failed: user ID was not received."
                );

                return;
            }

            // ==========================================
            // SAVE TOKEN
            // ==========================================

            localStorage.setItem("token", token);

            // ==========================================
            // SAVE USER
            // ==========================================

            localStorage.setItem(
                "user",
                JSON.stringify(user)
            );

            // ==========================================
            // SAVE USER ID
            // REQUIRED FOR SOCKET.IO
            // ==========================================

            localStorage.setItem(
                "userId",
                user._id
            );

            // ==========================================
            // VERIFY LOCAL STORAGE
            // ==========================================

            const savedToken =
                localStorage.getItem("token");

            const savedUser =
                localStorage.getItem("user");

            const savedUserId =
                localStorage.getItem("userId");

            console.log("=================================");
            console.log("💾 LOGIN DATA SAVED");

            console.log(
                "Token exists:",
                !!savedToken
            );

            console.log(
                "User exists:",
                !!savedUser
            );

            console.log(
                "User ID exists:",
                !!savedUserId
            );

            console.log(
                "User ID:",
                savedUserId
            );

            console.log("=================================");

            // ==========================================
            // FINAL VALIDATION
            // ==========================================

            if (!savedToken) {
                setError(
                    "Token could not be saved."
                );

                return;
            }

            if (!savedUserId) {
                setError(
                    "User ID could not be saved."
                );

                return;
            }

            // ==========================================
            // LOGIN SUCCESS
            // ==========================================

            console.log("✅ LOGIN SUCCESSFUL");
            console.log("➡️ Navigating to Dashboard...");

            // ==========================================
            // GO TO DASHBOARD
            // ==========================================

            navigate("/dashboard", {
                replace: true
            });

        } catch (error) {
            // ==========================================
            // LOGIN ERROR
            // ==========================================

            console.error("=================================");
            console.error("❌ LOGIN ERROR");
            console.error("=================================");

            console.error(error);

            console.error(
                "HTTP STATUS:",
                error.response?.status
            );

            console.error(
                "SERVER RESPONSE:",
                error.response?.data
            );

            console.error(
                "ERROR MESSAGE:",
                error.message
            );

            // ==========================================
            // SHOW ERROR
            // ==========================================

            setError(
                error.response?.data?.message ||
                "Login failed. Please check your email and password."
            );

        } finally {
            setLoading(false);
        }
    };

    // ==========================================
    // GO TO REGISTER
    // ==========================================

    const handleRegister = () => {
        navigate("/register");
    };

    // ==========================================
    // UI
    // ==========================================

    return (
        <div className="login-page">

            <h1>
                TaskFlow AI
            </h1>

            <h2>
                Login
            </h2>

            {/* ERROR */}

            {error && (
                <p
                    style={{
                        color: "red",
                        marginBottom: "15px"
                    }}
                >
                    {error}
                </p>
            )}

            {/* LOGIN FORM */}

            <form onSubmit={handleLogin}>

                {/* EMAIL */}

                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) =>
                        setEmail(e.target.value)
                    }
                    required
                />

                {/* PASSWORD */}

                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) =>
                        setPassword(e.target.value)
                    }
                    required
                />

                {/* LOGIN BUTTON */}

                <button
                    type="submit"
                    disabled={loading}
                >
                    {loading
                        ? "Logging in..."
                        : "Login"
                    }
                </button>

            </form>

            {/* REGISTER OPTION */}

            <div
                style={{
                    marginTop: "25px",
                    textAlign: "center"
                }}
            >
                <p
                    style={{
                        marginBottom: "10px"
                    }}
                >
                    Don't have an account?
                </p>

                <button
                    type="button"
                    onClick={handleRegister}
                    style={{
                        background: "transparent",
                        border: "none",
                        color: "#4f8cff",
                        cursor: "pointer",
                        fontWeight: "600",
                        fontSize: "15px"
                    }}
                >
                    Create Account
                </button>
            </div>

        </div>
    );
}

export default Login;