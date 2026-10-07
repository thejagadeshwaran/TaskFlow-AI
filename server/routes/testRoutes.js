const express = require("express");

const router = express.Router();

router.get("/gemini-connection", async (req, res) => {
    try {
        console.log("🧪 Testing Google Gemini connection...");

        const response = await fetch(
            "https://generativelanguage.googleapis.com"
        );

        console.log("Google response status:", response.status);

        res.json({
            success: true,
            googleReachable: true,
            status: response.status,
        });

    } catch (error) {
        console.error("❌ Google connection failed:", error.message);

        res.status(500).json({
            success: false,
            googleReachable: false,
            error: error.message,
        });
    }
});

module.exports = router;