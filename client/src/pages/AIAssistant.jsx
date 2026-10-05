import { useState } from "react";
import axios from "axios";
import "./AIAssistant.css";

function AIAssistant() {
    const [message, setMessage] = useState("");
    const [messages, setMessages] = useState([
        {
            role: "ai",
            text: "Hello! 👋 I'm TaskFlow AI. How can I help you with your tasks or projects?",
        },
    ]);

    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!message.trim() || loading) {
            return;
        }

        const userMessage = message.trim();

        // Add user message
        setMessages((previous) => [
            ...previous,
            {
                role: "user",
                text: userMessage,
            },
        ]);

        setMessage("");
        setLoading(true);

        try {
            const token = localStorage.getItem("token");

            const response = await axios.post(
                "http://localhost:5000/api/v1/ai/assistant",
                {
                    message: userMessage,
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                }
            );

            // Add AI response
            setMessages((previous) => [
                ...previous,
                {
                    role: "ai",
                    text:
                        response.data?.message ||
                        "Sorry, I couldn't generate a response.",
                },
            ]);

        } catch (error) {
            console.error(
                "AI Assistant Error:",
                error
            );

            setMessages((previous) => [
                ...previous,
                {
                    role: "ai",
                    text:
                        error.response?.data?.message ||
                        "❌ Something went wrong. Please try again.",
                },
            ]);

        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="ai-page">

            {/* Header */}
            <div className="ai-header">

                <div>
                    <h1>🤖 TaskFlow AI</h1>

                    <p>
                        Your intelligent productivity assistant
                    </p>
                </div>

            </div>


            {/* Chat */}
            <div className="ai-chat">

                {messages.map((item, index) => (

                    <div
                        key={index}
                        className={`message ${
                            item.role === "user"
                                ? "user-message"
                                : "ai-message"
                        }`}
                    >

                        <div className="message-avatar">
                            {item.role === "user"
                                ? "👤"
                                : "🤖"}
                        </div>

                        <div className="message-content">

                            <strong>
                                {item.role === "user"
                                    ? "You"
                                    : "TaskFlow AI"}
                            </strong>

                            <p>
                                {item.text}
                            </p>

                        </div>

                    </div>

                ))}


                {/* Loading */}
                {loading && (

                    <div className="message ai-message">

                        <div className="message-avatar">
                            🤖
                        </div>

                        <div className="message-content">

                            <strong>
                                TaskFlow AI
                            </strong>

                            <p>
                                Thinking... 🤔
                            </p>

                        </div>

                    </div>

                )}

            </div>


            {/* Input */}
            <form
                className="ai-input-container"
                onSubmit={handleSubmit}
            >

                <input
                    type="text"
                    value={message}
                    onChange={(e) =>
                        setMessage(e.target.value)
                    }
                    placeholder="Ask TaskFlow AI..."
                    disabled={loading}
                />

                <button
                    type="submit"
                    disabled={
                        loading ||
                        !message.trim()
                    }
                >
                    {loading
                        ? "..."
                        : "✨ Send"}
                </button>

            </form>

        </div>
    );
}

export default AIAssistant;