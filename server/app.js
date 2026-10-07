const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");

const { setIO } = require("./socket");

// ======================================================
// ROUTES
// ======================================================

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

// 🧪 TEMPORARY GEMINI CONNECTION TEST ROUTE
const testRoutes = require("./routes/testRoutes");

const app = express();

// ======================================================
// ALLOWED FRONTEND ORIGINS
// ======================================================

const allowedOrigins = [
    "http://localhost:5173",
    "https://task-flow-ai-liard.vercel.app",
];

// ======================================================
// CORS CONFIGURATION
// ======================================================

const corsOptions = {
    origin: function (origin, callback) {

        // Allow requests without an Origin
        // Example: Postman, server-to-server requests
        if (!origin) {
            return callback(null, true);
        }

        if (allowedOrigins.includes(origin)) {
            return callback(null, true);
        }

        console.log("❌ CORS blocked origin:", origin);

        return callback(
            new Error(`CORS blocked for origin: ${origin}`)
        );
    },

    credentials: true,

    methods: [
        "GET",
        "POST",
        "PUT",
        "PATCH",
        "DELETE",
        "OPTIONS",
    ],

    allowedHeaders: [
        "Content-Type",
        "Authorization",
    ],
};

// ======================================================
// MIDDLEWARE
// ======================================================

app.use(cors(corsOptions));

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

// ======================================================
// ROOT API
// ======================================================

app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "TaskFlow AI API is running",
    });
});

// ======================================================
// API ROUTES
// ======================================================

app.use(
    "/api/v1/auth",
    authRoutes
);

app.use(
    "/api/v1/users",
    userRoutes
);

app.use(
    "/api/v1/teams",
    teamRoutes
);

app.use(
    "/api/v1/projects",
    projectRoutes
);

app.use(
    "/api/v1/tasks",
    taskRoutes
);

app.use(
    "/api/v1/comments",
    commentRoutes
);

app.use(
    "/api/v1/activities",
    activityRoutes
);

app.use(
    "/api/v1/notifications",
    notificationRoutes
);

app.use(
    "/api/v1/analytics",
    analyticsRoutes
);

// ======================================================
// 🤖 AI PRODUCTIVITY ASSISTANT
// ======================================================

app.use(
    "/api/v1/ai",
    aiRoutes
);

// ======================================================
// 🧪 TEMPORARY GEMINI CONNECTION TEST
// ======================================================

app.use(
    "/api/v1/test",
    testRoutes
);

// ======================================================
// HTTP SERVER
// ======================================================

const server = http.createServer(app);

// ======================================================
// SOCKET.IO
// ======================================================

const io = new Server(server, {
    cors: {
        origin: function (origin, callback) {

            if (!origin) {
                return callback(null, true);
            }

            if (allowedOrigins.includes(origin)) {
                return callback(null, true);
            }

            console.log(
                "❌ Socket.IO CORS blocked:",
                origin
            );

            return callback(
                new Error(
                    `Socket.IO CORS blocked for origin: ${origin}`
                )
            );
        },

        methods: [
            "GET",
            "POST",
            "PUT",
            "PATCH",
            "DELETE",
        ],

        credentials: true,
    },
});

// ======================================================
// MAKE SOCKET.IO AVAILABLE TO OTHER BACKEND FILES
// ======================================================

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