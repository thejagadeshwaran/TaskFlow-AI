const express = require("express");
const router = express.Router();

const Activity = require("../models/Activity");

// ==========================================
// GET PROJECT ACTIVITIES
// ==========================================

router.get("/:projectId", async (req, res) => {
    try {
        console.log("=================================");
        console.log("Activity API called");
        console.log("Project ID:", req.params.projectId);
        console.log("=================================");

        const activities = await Activity.find({
            project: req.params.projectId
        })
            .populate("user", "name email")
            .sort({ createdAt: -1 });

        console.log("Activities found:", activities.length);

        res.status(200).json({
            success: true,
            count: activities.length,
            activities
        });

    } catch (error) {

        console.error("Activity API Error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch activities",
            error: error.message
        });
    }
});


// ==========================================
// EXPORT ROUTER
// ==========================================

module.exports = router;