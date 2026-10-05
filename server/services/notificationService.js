const Notification = require("../models/Notification");

const {
    getIO
} = require("../socket");


// ==========================================
// CREATE NOTIFICATION
// ==========================================

const createNotification = async ({
    recipient,
    sender,
    type,
    title,
    message,
    task,
    project
}) => {

    try {

        // ==========================================
        // CREATE NOTIFICATION IN DATABASE
        // ==========================================

        const notification =
            await Notification.create({
                recipient,
                sender,
                type,
                title,
                message,
                task,
                project
            });


        // ==========================================
        // POPULATE NOTIFICATION
        // ==========================================

        const populatedNotification =
            await Notification.findById(
                notification._id
            )
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
                );


        // ==========================================
        // GET SOCKET.IO
        // ==========================================

        const io = getIO();


        // ==========================================
        // SEND REAL-TIME NOTIFICATION
        // ==========================================

        if (io) {

            const room =
                `user_${recipient}`;

            io.to(room).emit(
                "new_notification",
                populatedNotification
            );

            console.log(
                "REAL-TIME NOTIFICATION SENT:",
                room
            );

        } else {

            console.log(
                "Socket.IO is not initialized"
            );

        }


        // ==========================================
        // RETURN NOTIFICATION
        // ==========================================

        return populatedNotification;

    } catch (error) {

        console.error(
            "Create notification error:",
            error
        );

        throw error;
    }
};


module.exports = {
    createNotification
};