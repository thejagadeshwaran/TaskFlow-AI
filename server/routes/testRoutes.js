const express = require("express");

const router = express.Router();

// ======================================================
// 🧪 TEST ACTUAL GEMINI API
// ======================================================

router.get("/gemini-api-test", async (req, res) => {
    try {

        console.log("=================================");
        console.log("🧪 TESTING ACTUAL GEMINI API");
        console.log("=================================");

        const apiKey = process.env.GEMINI_API_KEY;

        if (!apiKey) {
            console.error("❌ GEMINI_API_KEY is missing");

            return res.status(500).json({
                success: false,
                message: "GEMINI_API_KEY is missing",
            });
        }

        console.log("✅ GEMINI_API_KEY exists");
        console.log("🔄 Calling Gemini REST API...");

        const controller = new AbortController();

        const timeout = setTimeout(() => {
            controller.abort();
        }, 30000);

        try {

            const response = await fetch(
                "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent?key=" +
                    encodeURIComponent(apiKey),
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json",
                    },

                    body: JSON.stringify({
                        contents: [
                            {
                                parts: [
                                    {
                                        text: "Reply with exactly: Hello from Gemini",
                                    },
                                ],
                            },
                        ],
                    }),

                    signal: controller.signal,
                }
            );

            clearTimeout(timeout);

            const responseText = await response.text();

            console.log(
                "Gemini HTTP status:",
                response.status
            );

            console.log(
                "Gemini response:",
                responseText.slice(0, 1000)
            );

            console.log("=================================");

            return res.status(200).json({
                success: response.ok,
                status: response.status,
                response: responseText.slice(0, 1000),
            });

        } catch (error) {

            clearTimeout(timeout);

            console.error(
                "❌ Gemini request failed:",
                error.message
            );

            return res.status(500).json({
                success: false,
                error: error.name === "AbortError"
                    ? "Gemini request timed out after 30 seconds"
                    : error.message,
            });
        }

    } catch (error) {

        console.error(
            "❌ Test route error:",
            error.message
        );

        return res.status(500).json({
            success: false,
            error: error.message,
        });
    }
});

module.exports = router;