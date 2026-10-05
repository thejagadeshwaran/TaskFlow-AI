const jwt = require("jsonwebtoken");
const { Server } = require("socket.io");

let io;

const initSocket = (httpServer) => {
    io = new Server(httpServer, {
        cors: {
            origin: "http://localhost:5173",
            methods: ["GET", "POST"]
        }
    });

    // Socket authentication
    io.use((socket, next) => {
        try {
            const token = socket.handshake.auth?.token;

            if (!token) {
                return next(new Error("Authentication required"));
            }

            const decoded = jwt.verify(
                token,
                process.env.JWT_SECRET
            );

            socket.userId = decoded.userId;
            socket.role = decoded.role;

            next();

        } catch (error) {
            next(new Error("Invalid or expired token"));
        }
    });

    // Client connected
    io.on("connection", (socket) => {

        console.log(
            `Socket connected: ${socket.userId}`
        );

        // Personal room
        socket.join(`user:${socket.userId}`);

        // Join project room
        socket.on("join_project", (projectId) => {

            socket.join(`project:${projectId}`);

            console.log(
                `User ${socket.userId} joined project ${projectId}`
            );
        });

        // Leave project room
        socket.on("leave_project", (projectId) => {

            socket.leave(`project:${projectId}`);

            console.log(
                `User ${socket.userId} left project ${projectId}`
            );
        });

        // Disconnect
        socket.on("disconnect", () => {

            console.log(
                `Socket disconnected: ${socket.userId}`
            );
        });
    });

    return io;
};

const getIO = () => {
    if (!io) {
        throw new Error("Socket.IO is not initialized");
    }

    return io;
};

module.exports = {
    initSocket,
    getIO
};