import { io } from "socket.io-client";

// ==========================================
// SOCKET SERVER URL
// ==========================================

const SOCKET_URL =
    import.meta.env.VITE_SOCKET_URL ||
    "https://taskflow-ai-7mpo.onrender.com";

// ==========================================
// SOCKET CONNECTION
// ==========================================

const socket = io(SOCKET_URL, {
    autoConnect: false,
    withCredentials: true,
});

// ==========================================
// CONNECT SOCKET
// ==========================================

export const connectSocket = () => {

    const token = localStorage.getItem("token");

    if (!token) {
        console.log(
            "⚠️ Socket connection skipped: token missing"
        );

        return;
    }

    socket.auth = {
        token,
    };

    if (!socket.connected) {

        console.log(
            "🔌 Connecting to Socket.IO:",
            SOCKET_URL
        );

        socket.connect();
    }
};

// ==========================================
// DISCONNECT SOCKET
// ==========================================

export const disconnectSocket = () => {

    if (socket.connected) {

        console.log(
            "🔌 Disconnecting Socket.IO"
        );

        socket.disconnect();
    }
};

export default socket;