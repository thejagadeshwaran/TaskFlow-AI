const express = require("express");

const {
    aiAssistant
} = require("../controllers/aiController");

const {
    protect
} = require("../middleware/authMiddleware");

const router = express.Router();

// AI Productivity Assistant
router.post(
    "/assistant",
    protect,
    aiAssistant
);

module.exports = router;