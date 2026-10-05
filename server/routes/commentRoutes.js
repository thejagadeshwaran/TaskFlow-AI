const express = require("express");

const {
    createComment,
    getTaskComments
} = require("../controllers/commentController");

const { protect } = require("../middleware/authMiddleware");

const router = express.Router();


// Add comment
router.post(
    "/task/:taskId",
    protect,
    createComment
);


// Get task comments
router.get(
    "/task/:taskId",
    protect,
    getTaskComments
);


module.exports = router;