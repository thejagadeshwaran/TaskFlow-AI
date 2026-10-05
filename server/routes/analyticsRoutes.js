const express = require("express");

const {
    getProjectAnalytics,
    getTaskStatistics,
    getPriorityStatistics
} = require("../controllers/analyticsController");

const {
    protect
} = require("../middleware/authMiddleware");

const router = express.Router();

// Project analytics
router.get(
    "/project/:projectId",
    protect,
    getProjectAnalytics
);

// Task statistics by status
router.get(
    "/project/:projectId/task-statistics",
    protect,
    getTaskStatistics
);

// Task statistics by priority
router.get(
    "/project/:projectId/priority-statistics",
    protect,
    getPriorityStatistics
);

module.exports = router;