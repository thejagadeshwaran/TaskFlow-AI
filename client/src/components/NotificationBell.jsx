import { useEffect, useState } from "react";
import api from "../services/api";
import socket, {
    connectSocket
} from "../services/socket";

function NotificationBell() {

    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [open, setOpen] = useState(false);

    const fetchNotifications = async () => {
        try {
            const response = await api.get("/notifications");

            setNotifications(
                response.data.notifications || []
            );

            setUnreadCount(
                response.data.unreadCount || 0
            );

        } catch (error) {
            console.error(
                "Notification error:",
                error
            );
        }
    };

    // Initial fetch + real-time listener
    useEffect(() => {
        fetchNotifications();

        connectSocket();

        const handleNotification = (notification) => {
            setNotifications((prev) => [
                notification,
                ...prev
            ]);

            setUnreadCount((prev) => prev + 1);
        };

        socket.on("notification", handleNotification);

        return () => {
            socket.off("notification", handleNotification);
        };
    }, []);

    const markAsRead = async (id) => {
        try {
            await api.put(`/notifications/${id}/read`);
            fetchNotifications();
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div className="notification-container">

            <button
                onClick={() => setOpen(!open)}
                className="notification-button"
            >
                🔔

                {unreadCount > 0 && (
                    <span className="notification-count">
                        {unreadCount}
                    </span>
                )}
            </button>

            {open && (
                <div className="notification-dropdown">
                    <h3>Notifications</h3>

                    {notifications.length === 0 ? (
                        <p>No notifications</p>
                    ) : (
                        notifications.map(notification => (
                            <div
                                key={notification._id}
                                className={
                                    notification.isRead
                                        ? "notification"
                                        : "notification unread"
                                }
                                onClick={() =>
                                    markAsRead(notification._id)
                                }
                            >
                                <strong>
                                    {notification.title}
                                </strong>
                                <p>
                                    {notification.message}
                                </p>
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
}

export default NotificationBell;