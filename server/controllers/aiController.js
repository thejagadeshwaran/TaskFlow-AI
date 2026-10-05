const axios = require("axios");

// POST /api/v1/ai/assistant
const aiAssistant = async (req, res) => {
    try {
        const { message } = req.body;

        if (!message || !message.trim()) {
            return res.status(400).json({
                success: false,
                message: "Message is required",
            });
        }

        const apiKey = process.env.GEMINI_API_KEY;

        if (!apiKey) {
            return res.status(500).json({
                success: false,
                message: "Gemini API key is not configured",
            });
        }

        const model = "gemini-3.8-flash";

        const url =
            `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;

        const requestData = {
            contents: [
                {
                    role: "user",
                    parts: [
                        {
                            text: `
You are TaskFlow AI, a productivity and project management assistant.

Help users with:
- Task management
- Project planning
- Task prioritization
- Breaking large tasks into smaller tasks
- Productivity
- Time management
- Software development
- MERN stack projects

Give clear, practical and structured answers.

User message:
${message.trim()}
                            `,
                        },
                    ],
                },
            ],
        };

        const maxRetries = 3;

        for (let attempt = 1; attempt <= maxRetries; attempt++) {

            try {
                console.log(
                    `🤖 Gemini request attempt ${attempt}/${maxRetries}`
                );

                const response = await axios.post(
                    url,
                    requestData,
                    {
                        headers: {
                            "Content-Type": "application/json",
                            "x-goog-api-key": apiKey,
                        },
                        timeout: 30000,
                    }
                );

                const aiReply =
                    response.data?.candidates?.[0]
                        ?.content?.parts?.[0]?.text;

                if (!aiReply) {
                    console.error(
                        "❌ Gemini returned no text:"
                    );

                    console.error(
                        JSON.stringify(
                            response.data,
                            null,
                            2
                        )
                    );

                    return res.status(500).json({
                        success: false,
                        message: "No response received from AI",
                    });
                }

                console.log("✅ Gemini response received");

                return res.status(200).json({
                    success: true,
                    message: aiReply,
                });

            } catch (error) {

                const status = error.response?.status;

                console.error(
                    `❌ Gemini attempt ${attempt} failed`
                );

                console.error(
                    "Status:",
                    status
                );

                console.error(
                    "Error:",
                    error.response?.data?.error?.message ||
                    error.message
                );

                // Retry only temporary server errors
                if (
                    status === 503 ||
                    status === 429 ||
                    status === 500
                ) {

                    if (attempt < maxRetries) {

                        const delay = attempt * 2000;

                        console.log(
                            `⏳ Retrying in ${delay / 1000} seconds...`
                        );

                        await new Promise(
                            resolve =>
                                setTimeout(resolve, delay)
                        );

                        continue;
                    }
                }

                // Don't retry other errors
                return res.status(status || 500).json({
                    success: false,
                    message: "AI Assistant failed",
                    error:
                        error.response?.data?.error?.message ||
                        error.message,
                });
            }
        }

    } catch (error) {

        console.error(
            "================================="
        );

        console.error(
            "❌ AI ASSISTANT ERROR"
        );

        console.error(
            "================================="
        );

        console.error(
            error.message
        );

        console.error(
            "================================="
        );

        return res.status(500).json({
            success: false,
            message: "AI Assistant failed",
            error: error.message,
        });
    }
};

module.exports = {
    aiAssistant,
};