const Notification = require("../models/Notification");


// GET MY NOTIFICATIONS

const getMyNotifications = async (req, res) => {
    try {

        const notifications =
            await Notification.find({
                recipient: req.user.userId
            })
            .populate(
                "sender",
                "name email avatar"
            )
            .populate(
                "task",
                "title status"
            )
            .populate(
                "project",
                "name"
            )
            .sort({
                createdAt: -1
            })
            .limit(50);

        const unreadCount =
            await Notification.countDocuments({
                recipient: req.user.userId,
                isRead: false
            });

        res.status(200).json({
            success: true,
            unreadCount,
            notifications
        });

    } catch (error) {

        console.error(
            "Get notifications error:",
            error
        );

        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};


// MARK ONE AS READ

const markNotificationAsRead = async (
    req,
    res
) => {
    try {

        const notification =
            await Notification.findOne({
                _id: req.params.id,
                recipient: req.user.userId
            });

        if (!notification) {
            return res.status(404).json({
                success: false,
                message: "Notification not found"
            });
        }

        notification.isRead = true;

        await notification.save();

        res.status(200).json({
            success: true,
            message: "Notification marked as read"
        });

    } catch (error) {

        console.error(
            "Mark notification error:",
            error
        );

        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};


// MARK ALL AS READ

const markAllNotificationsAsRead = async (
    req,
    res
) => {
    try {

        await Notification.updateMany(
            {
                recipient: req.user.userId,
                isRead: false
            },
            {
                $set: {
                    isRead: true
                }
            }
        );

        res.status(200).json({
            success: true,
            message: "All notifications marked as read"
        });

    } catch (error) {

        console.error(
            "Mark all notifications error:",
            error
        );

        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};


module.exports = {
    getMyNotifications,
    markNotificationAsRead,
    markAllNotificationsAsRead
};