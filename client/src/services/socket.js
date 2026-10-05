import { io } from "socket.io-client";

const socket = io("http://localhost:5000", {
    autoConnect: false
});

export const connectSocket = () => {

    const token = localStorage.getItem("token");

    if (!token) {
        return;
    }

    socket.auth = {
        token
    };

    if (!socket.connected) {
        socket.connect();
    }
};

export const disconnectSocket = () => {

    if (socket.connected) {
        socket.disconnect();
    }
};

export default socket;