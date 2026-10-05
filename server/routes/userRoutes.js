const express = require("express");

const {
    getMyProfile,
    updateMyProfile,
    updatePassword
} = require("../controllers/userController");

const { protect } = require("../middleware/authMiddleware");

const router = express.Router();


// Get logged-in user's profile
router.get("/me", protect, getMyProfile);


// Update profile
router.put("/me", protect, updateMyProfile);


// Change password
router.put("/me/password", protect, updatePassword);


module.exports = router;