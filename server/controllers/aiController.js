const { GoogleGenAI } = require("@google/genai");

// ======================================================
// 🤖 TASKFLOW AI ASSISTANT
// ======================================================

const aiAssistant = async (req, res) => {
    try {

        const { message } = req.body;

        // ==================================================
        // VALIDATE MESSAGE
        // ==================================================

        if (!message || !message.trim()) {
            return res.status(400).json({
                success: false,
                message: "Message is required",
            });
        }

        // ==================================================
        // GEMINI API KEY
        // ==================================================

        const apiKey = process.env.GEMINI_API_KEY;

        if (!apiKey) {

            console.error(
                "❌ GEMINI_API_KEY is missing"
            );

            return res.status(500).json({
                success: false,
                message:
                    "Gemini API key is not configured",
            });
        }

        // ==================================================
        // LOG REQUEST
        // ==================================================

        console.log("=================================");
        console.log("🤖 TASKFLOW AI REQUEST");
        console.log("=================================");
        console.log(
            "Model: gemini-3.5-flash"
        );
        console.log(
            "Message:",
            message.trim()
        );
        console.log("=================================");

        // ==================================================
        // INITIALIZE GEMINI
        // ==================================================

        const ai = new GoogleGenAI({
            apiKey: apiKey,
        });

        // ==================================================
        // GEMINI REQUEST
        // ==================================================

        const response =
            await ai.models.generateContent({
                model: "gemini-3.5-flash",

                contents: `
You are TaskFlow AI, a productivity and project management assistant.

Help users with:

- Task management
- Project planning
- Task prioritization
- Breaking large tasks into smaller tasks
- Productivity
- Time management
- Software development
- MERN stack development
- Debugging
- Git and GitHub
- Interview preparation

Give clear, practical and structured answers.

Prefer:

- Short explanations
- Bullet points
- Step-by-step solutions
- Practical examples
- Code examples when useful

User message:
${message.trim()}
                `,
            });

        // ==================================================
        // GET AI RESPONSE
        // ==================================================

        const aiReply = response.text;

        if (!aiReply) {

            console.error(
                "❌ Gemini returned no text"
            );

            return res.status(500).json({
                success: false,
                message:
                    "No response received from AI",
            });
        }

        // ==================================================
        // SUCCESS
        // ==================================================

        console.log(
            "✅ Gemini response received"
        );

        console.log(
            "================================="
        );

        return res.status(200).json({
            success: true,
            message: aiReply,
        });

    } catch (error) {

        // ==================================================
        // ERROR
        // ==================================================

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
            "Message:",
            error.message
        );

        console.error(
            "================================="
        );

        return res.status(500).json({
            success: false,
            message:
                "AI Assistant failed",
            error: error.message,
        });
    }
};

// ======================================================
// EXPORT
// ======================================================

module.exports = {
    aiAssistant,
};