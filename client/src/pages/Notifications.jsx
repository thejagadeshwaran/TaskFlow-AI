import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import api from "../services/api";
import "./Notifications.css";

const SOCKET_URL = "http://localhost:5000";

function Notifications() {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [markingId, setMarkingId] = useState(null);
    const [markingAll, setMarkingAll] = useState(false);
    const [error, setError] = useState("");

    // ==========================================
    // USER ID
    // ==========================================

    const userId = localStorage.getItem("userId");

    // ==========================================
    // FETCH NOTIFICATIONS
    // ==========================================

    const fetchNotifications = async (showLoading = true) => {
        try {
            if (showLoading) {
                setLoading(true);
            }

            setError("");

            console.log(
                "📥 Fetching notifications..."
            );

            const response =
                await api.get("/notifications");

            console.log(
                "NOTIFICATION RESPONSE:",
                response.data
            );

            setNotifications(
                response.data.notifications || []
            );

            setUnreadCount(
                response.data.unreadCount || 0
            );

        } catch (error) {
            console.error(
                "NOTIFICATION FETCH ERROR:",
                error.response?.data ||
                error.message
            );

            if (showLoading) {
                setError(
                    error.response?.data?.message ||
                    "Failed to load notifications"
                );
            }

        } finally {
            if (showLoading) {
                setLoading(false);
            }
        }
    };

    // ==========================================
    // SOCKET.IO REAL-TIME CONNECTION
    // ==========================================

    useEffect(() => {
        if (!userId) {
            console.error(
                "❌ No userId found in localStorage"
            );

            return;
        }

        console.log(
            "🔌 Connecting to Socket.IO..."
        );

        const socket = io(SOCKET_URL, {
            transports: ["websocket"],
        });

        // ======================================
        // SOCKET CONNECTED
        // ======================================

        socket.on("connect", () => {
            console.log(
                "🔌 Socket connected:",
                socket.id
            );

            // Join user's private notification room
            socket.emit(
                "join",
                userId
            );

            console.log(
                `👤 Joining notification room: user_${userId}`
            );
        });

        // ======================================
        // NEW NOTIFICATION
        // ======================================

        socket.on(
            "new_notification",
            (notification) => {
                console.log(
                    "🔔 NEW REAL-TIME NOTIFICATION:",
                    notification
                );

                if (!notification?._id) {
                    console.error(
                        "❌ Invalid notification received"
                    );

                    return;
                }

                // Prevent duplicate notification
                setNotifications(
                    (previousNotifications) => {

                        const alreadyExists =
                            previousNotifications.some(
                                (item) =>
                                    item._id ===
                                    notification._id
                            );

                        if (alreadyExists) {
                            return previousNotifications;
                        }

                        return [
                            notification,
                            ...previousNotifications,
                        ];
                    }
                );

                // Increase unread count
                setUnreadCount(
                    (previousCount) =>
                        previousCount + 1
                );
            }
        );

        // ======================================
        // SOCKET ERROR
        // ======================================

        socket.on(
            "connect_error",
            (error) => {
                console.error(
                    "❌ Socket connection error:",
                    error.message
                );
            }
        );

        // ======================================
        // SOCKET DISCONNECTED
        // ======================================

        socket.on(
            "disconnect",
            (reason) => {
                console.log(
                    "🔌 Socket disconnected:",
                    reason
                );
            }
        );

        // ======================================
        // CLEANUP
        // ======================================

        return () => {
            console.log(
                "🔌 Closing Socket.IO connection"
            );

            socket.disconnect();
        };

    }, [userId]);

    // ==========================================
    // MARK ONE NOTIFICATION AS READ
    // ==========================================

    const markAsRead = async (notificationId) => {
        try {
            setMarkingId(notificationId);

            console.log(
                "Marking notification as read:",
                notificationId
            );

            await api.put(
                `/notifications/${notificationId}/read`
            );

            console.log(
                "✅ Notification marked as read"
            );

            setNotifications(
                (previousNotifications) =>
                    previousNotifications.map(
                        (notification) =>
                            notification._id ===
                            notificationId
                                ? {
                                      ...notification,
                                      isRead: true,
                                  }
                                : notification
                    )
            );

            setUnreadCount(
                (previousCount) =>
                    Math.max(
                        previousCount - 1,
                        0
                    )
            );

        } catch (error) {
            console.error(
                "MARK AS READ ERROR:",
                error.response?.data ||
                error.message
            );

            alert(
                error.response?.data?.message ||
                "Failed to mark notification as read"
            );

        } finally {
            setMarkingId(null);
        }
    };

    // ==========================================
    // MARK ALL NOTIFICATIONS AS READ
    // ==========================================

    const markAllAsRead = async () => {
        if (unreadCount === 0) {
            return;
        }

        try {
            setMarkingAll(true);

            console.log(
                "Marking all notifications as read..."
            );

            await api.put(
                "/notifications/read-all"
            );

            console.log(
                "✅ All notifications marked as read"
            );

            setNotifications(
                (previousNotifications) =>
                    previousNotifications.map(
                        (notification) => ({
                            ...notification,
                            isRead: true,
                        })
                    )
            );

            setUnreadCount(0);

        } catch (error) {
            console.error(
                "MARK ALL AS READ ERROR:",
                error.response?.data ||
                error.message
            );

            alert(
                error.response?.data?.message ||
                "Failed to mark all notifications as read"
            );

        } finally {
            setMarkingAll(false);
        }
    };

    // ==========================================
    // INITIAL LOAD + AUTO REFRESH
    // ==========================================

    useEffect(() => {

        // Initial API request
        fetchNotifications(true);

        // Fallback refresh every 10 seconds
        const interval =
            setInterval(() => {

                console.log(
                    "🔄 Auto refreshing notifications..."
                );

                fetchNotifications(false);

            }, 10000);

        // Cleanup
        return () => {
            clearInterval(interval);
        };

    }, []);

    // ==========================================
    // NOTIFICATION ICON
    // ==========================================

    const getNotificationIcon = (type) => {
        switch (type) {

            case "task_assigned":
                return "📋";

            case "comment":
                return "💬";

            case "status_changed":
                return "🔄";

            case "project_added":
                return "📁";

            case "deadline":
                return "⏰";

            default:
                return "🔔";
        }
    };

    // ==========================================
    // FORMAT DATE
    // ==========================================

    const formatDate = (date) => {

        if (!date) {
            return "";
        }

        return new Date(
            date
        ).toLocaleString();
    };

    // ==========================================
    // LOADING SCREEN
    // ==========================================

    if (loading) {

        return (
            <div className="notification-loading">

                <div className="notification-loading-icon">
                    🔔
                </div>

                <h2>
                    Loading notifications...
                </h2>

            </div>
        );
    }

    // ==========================================
    // ERROR SCREEN
    // ==========================================

    if (error) {

        return (
            <div className="notification-error">

                <div className="notification-error-icon">
                    ⚠️
                </div>

                <h2>
                    Something went wrong
                </h2>

                <p>
                    {error}
                </p>

                <button
                    onClick={() =>
                        fetchNotifications(true)
                    }
                >
                    🔄 Try Again
                </button>

            </div>
        );
    }

    // ==========================================
    // MAIN PAGE
    // ==========================================

    return (
        <div className="notifications-page">

            {/* ==================================
                HEADER
            ================================== */}

            <div className="notifications-header">

                <div>

                    <h1>
                        🔔 Notifications
                    </h1>

                    <p>
                        Stay updated with your
                        TaskFlow activities.
                    </p>

                </div>

                <div className="notification-header-actions">

                    <div className="notification-count">
                        {unreadCount} unread
                    </div>

                    <button
                        className="mark-all-btn"
                        onClick={markAllAsRead}
                        disabled={
                            unreadCount === 0 ||
                            markingAll
                        }
                    >
                        {markingAll
                            ? "Marking..."
                            : "✓ Mark All as Read"}
                    </button>

                </div>

            </div>

            {/* ==================================
                NOTIFICATION LIST
            ================================== */}

            {notifications.length === 0 ? (

                <div className="empty-notifications">

                    <div className="empty-icon">
                        🔔
                    </div>

                    <h2>
                        No notifications
                    </h2>

                    <p>
                        You're all caught up!
                    </p>

                </div>

            ) : (

                <div className="notification-list">

                    {notifications.map(
                        (notification) => (

                            <div
                                key={
                                    notification._id
                                }
                                className={`notification-item ${
                                    notification.isRead
                                        ? "read"
                                        : "unread"
                                }`}
                                onClick={() => {

                                    if (
                                        !notification.isRead &&
                                        markingId !==
                                            notification._id
                                    ) {
                                        markAsRead(
                                            notification._id
                                        );
                                    }

                                }}
                                style={{
                                    cursor:
                                        notification.isRead
                                            ? "default"
                                            : "pointer",
                                }}
                            >

                                {/* ICON */}

                                <div className="notification-icon">

                                    {getNotificationIcon(
                                        notification.type
                                    )}

                                </div>

                                {/* CONTENT */}

                                <div className="notification-content">

                                    <h3>
                                        {
                                            notification.title ||
                                            "Notification"
                                        }
                                    </h3>

                                    <p>
                                        {
                                            notification.message ||
                                            "You have a new notification."
                                        }
                                    </p>

                                    <span>
                                        {formatDate(
                                            notification.createdAt
                                        )}
                                    </span>

                                </div>

                                {/* UNREAD INDICATOR */}

                                {!notification.isRead && (

                                    <div className="unread-dot">

                                        {markingId ===
                                        notification._id
                                            ? "..."
                                            : ""}

                                    </div>

                                )}

                            </div>

                        )
                    )}

                </div>

            )}

        </div>
    );
}

export default Notifications;