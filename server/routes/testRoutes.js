const express = require("express");

const router = express.Router();

// ======================================================
// 🧪 LIST AVAILABLE GEMINI MODELS
// ======================================================

router.get("/gemini-models", async (req, res) => {
    try {

        console.log("=================================");
        console.log("🧪 LISTING AVAILABLE GEMINI MODELS");
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
        console.log("🔄 Requesting model list...");

        const response = await fetch(
            "https://generativelanguage.googleapis.com/v1beta/models?key=" +
                encodeURIComponent(apiKey)
        );

        const data = await response.json();

        console.log(
            "Gemini models HTTP status:",
            response.status
        );

        if (!response.ok) {

            console.error(
                "❌ Failed to retrieve models"
            );

            return res.status(200).json({
                success: false,
                status: response.status,
                error: data,
            });
        }

        const models = (data.models || [])
            .filter((model) =>
                model.supportedGenerationMethods?.includes(
                    "generateContent"
                )
            )
            .map((model) => ({
                name: model.name,
                displayName: model.displayName,
            }));

        console.log(
            `✅ Found ${models.length} generateContent models`
        );

        console.log("=================================");

        return res.status(200).json({
            success: true,
            status: response.status,
            models,
        });

    } catch (error) {

        console.error("=================================");
        console.error("❌ MODEL LIST ERROR");
        console.error("=================================");
        console.error("Error:", error.message);
        console.error("=================================");

        return res.status(500).json({
            success: false,
            error: error.message,
        });
    }
});

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

            console.error(
                "❌ GEMINI_API_KEY is missing"
            );

            return res.status(500).json({
                success: false,
                message: "GEMINI_API_KEY is missing",
            });
        }

        console.log(
            "✅ GEMINI_API_KEY exists"
        );

        console.log(
            "🔄 Calling Gemini REST API..."
        );

        const controller =
            new AbortController();

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
                                        text:
                                            "Reply with exactly: Hello from Gemini",
                                    },
                                ],
                            },
                        ],
                    }),

                    signal: controller.signal,
                }
            );

            clearTimeout(timeout);

            const responseText =
                await response.text();

            console.log(
                "Gemini HTTP status:",
                response.status
            );

            console.log(
                "Gemini response:",
                responseText.slice(0, 1000)
            );

            console.log(
                "================================="
            );

            return res.status(200).json({
                success: response.ok,
                status: response.status,
                response:
                    responseText.slice(0, 1000),
            });

        } catch (error) {

            clearTimeout(timeout);

            console.error(
                "❌ Gemini request failed:",
                error.message
            );

            return res.status(500).json({
                success: false,
                error:
                    error.name === "AbortError"
                        ? "Gemini request timed out after 30 seconds"
                        : error.message,
            });
        }

    } catch (error) {

        console.error(
            "================================="
        );

        console.error(
            "❌ Test route error:",
            error.message
        );

        console.error(
            "================================="
        );

        return res.status(500).json({
            success: false,
            error: error.message,
        });
    }
});

// ======================================================
// EXPORT
// ======================================================

module.exports = router;