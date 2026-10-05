const express = require("express");

const {
    createTeam,
    getMyTeams,
    getTeamById,
    addMember,
    removeMember
} = require("../controllers/teamController");

const { protect } = require("../middleware/authMiddleware");

const router = express.Router();


// Create team
router.post("/", protect, createTeam);


// Get my teams
router.get("/", protect, getMyTeams);


// Get single team
router.get("/:id", protect, getTeamById);


// Add member
router.post("/:id/members", protect, addMember);


// Remove member
router.delete(
    "/:id/members/:userId",
    protect,
    removeMember
);


module.exports = router;