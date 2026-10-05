const express = require("express");

const {
    getMyNotifications,
    markNotificationAsRead,
    markAllNotificationsAsRead
} = require("../controllers/notificationController");

const {
    protect
} = require("../middleware/authMiddleware");

const router = express.Router();


// Get notifications
router.get(
    "/",
    protect,
    getMyNotifications
);


// Mark one as read
router.put(
    "/:id/read",
    protect,
    markNotificationAsRead
);


// Mark all as read
router.put(
    "/read-all",
    protect,
    markAllNotificationsAsRead
);


module.exports = router;