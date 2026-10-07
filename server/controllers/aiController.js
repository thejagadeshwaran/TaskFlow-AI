const { GoogleGenAI } = require("@google/genai");

// POST /api/v1/ai/assistant
const aiAssistant = async (req, res) => {
    try {
        const { message } = req.body;

        // Validate message
        if (!message || !message.trim()) {
            return res.status(400).json({
                success: false,
                message: "Message is required",
            });
        }

        // Get Gemini API key
        const apiKey = process.env.GEMINI_API_KEY;

        if (!apiKey) {
            console.error("❌ GEMINI_API_KEY is missing");

            return res.status(500).json({
                success: false,
                message: "Gemini API key is not configured",
            });
        }

        console.log("=================================");
        console.log("🤖 TaskFlow AI request");
        console.log("=================================");
        console.log("Model: gemini-3.8-flash");
        console.log("Message:", message.trim());
        console.log("=================================");

        // Initialize Gemini
        const ai = new GoogleGenAI({
            apiKey: apiKey,
        });

        // Generate AI response
        const response = await ai.models.generateContent({
            model: "gemini-3.8-flash",

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

        const aiReply = response.text;

        if (!aiReply) {
            console.error("❌ Gemini returned no text");

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
        console.error("=================================");
        console.error("❌ AI ASSISTANT ERROR");
        console.error("=================================");
        console.error("Message:", error.message);
        console.error("=================================");

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