const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");

const { setIO } = require("./socket");

const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const teamRoutes = require("./routes/teamRoutes");
const projectRoutes = require("./routes/projectRoutes");
const taskRoutes = require("./routes/taskRoutes");
const commentRoutes = require("./routes/commentRoutes");
const activityRoutes = require("./routes/activityRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const analyticsRoutes = require("./routes/analyticsRoutes");

// 🤖 AI Routes
const aiRoutes = require("./routes/aiRoutes");

const app = express();

// ======================================================
// MIDDLEWARE
// ======================================================

app.use(
    cors({
        origin: "http://localhost:5173",
        credentials: true,
    })
);

app.use(express.json());

// ======================================================
// ROOT API
// ======================================================

app.get("/", (req, res) => {
    res.json({
        message: "TaskFlow AI API is running",
    });
});

// ======================================================
// API ROUTES
// ======================================================

app.use("/api/v1/auth", authRoutes);

app.use("/api/v1/users", userRoutes);

app.use("/api/v1/teams", teamRoutes);

app.use("/api/v1/projects", projectRoutes);

app.use("/api/v1/tasks", taskRoutes);

app.use("/api/v1/comments", commentRoutes);

app.use("/api/v1/activities", activityRoutes);

app.use("/api/v1/notifications", notificationRoutes);

app.use("/api/v1/analytics", analyticsRoutes);

// 🤖 AI Productivity Assistant
app.use("/api/v1/ai", aiRoutes);

// ======================================================
// HTTP SERVER
// ======================================================

const server = http.createServer(app);

// ======================================================
// SOCKET.IO
// ======================================================

const io = new Server(server, {
    cors: {
        origin: "http://localhost:5173",

        methods: [
            "GET",
            "POST",
            "PUT",
            "DELETE",
        ],

        credentials: true,
    },
});

// Make Socket.IO available to other backend files
setIO(io);

// ======================================================
// SOCKET CONNECTION
// ======================================================

io.on("connection", (socket) => {

    console.log(
        "🔌 Socket connected:",
        socket.id
    );

    // ==================================================
    // USER NOTIFICATION ROOM
    // ==================================================

    socket.on("join", (userId) => {

        if (!userId) {

            console.log(
                "⚠️ Socket join failed: userId missing"
            );

            return;
        }

        const room = `user_${userId}`;

        socket.join(room);

        console.log(
            `👤 User ${userId} joined room ${room}`
        );
    });

    // ==================================================
    // PROJECT ROOM
    // ==================================================

    socket.on(
        "join_project",
        (projectId) => {

            if (!projectId) {

                console.log(
                    "⚠️ Project join failed: projectId missing"
                );

                return;
            }

            const room =
                `project_${projectId}`;

            socket.join(room);

            console.log(
                `📁 Socket ${socket.id} joined project room ${room}`
            );
        }
    );

    // ==================================================
    // USER LEAVES PROJECT ROOM
    // ==================================================

    socket.on(
        "leave_project",
        (projectId) => {

            if (!projectId) {
                return;
            }

            const room =
                `project_${projectId}`;

            socket.leave(room);

            console.log(
                `📤 Socket ${socket.id} left project room ${room}`
            );
        }
    );

    // ==================================================
    // DISCONNECT
    // ==================================================

    socket.on("disconnect", () => {

        console.log(
            "🔌 Socket disconnected:",
            socket.id
        );

    });

});

// ======================================================
// EXPORT SERVER
// ======================================================

module.exports = server;