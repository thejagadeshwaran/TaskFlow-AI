const express = require("express");

const {
    createTask,
    getProjectTasks,
    getTaskById,
    updateTask,
    deleteTask
} = require("../controllers/taskController");

const { protect } = require("../middleware/authMiddleware");

const router = express.Router();


// Create task
router.post("/", protect, createTask);


// Get tasks for project
router.get("/project/:projectId", protect, getProjectTasks);


// Get single task
router.get("/:id", protect, getTaskById);


// Update task
router.put("/:id", protect, updateTask);


// Delete task
router.delete("/:id", protect, deleteTask);


module.exports = router;