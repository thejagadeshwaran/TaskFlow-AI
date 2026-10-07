require("dotenv").config();

const server = require("./app");
const connectDB = require("./config/db");

const PORT = process.env.PORT || 5000;

const startServer = async () => {
    try {
        console.log("=================================");
        console.log("🔄 Starting TaskFlow AI...");
        console.log("=================================");

        // ==========================================
        // CONNECT DATABASE FIRST
        // ==========================================

        await connectDB();

        console.log("=================================");
        console.log("✅ Database connection completed");
        console.log("=================================");

        // ==========================================
        // START HTTP + SOCKET.IO SERVER
        // ==========================================

        server.listen(PORT, "0.0.0.0", () => {
            console.log("=================================");
            console.log("🚀 TASKFLOW AI SERVER STARTED");
            console.log("=================================");
            console.log(`🌐 Port: ${PORT}`);
            console.log("🔌 Socket.IO: Enabled");
            console.log("=================================");
        });

    } catch (error) {
        console.error("=================================");
        console.error("❌ SERVER STARTUP FAILED");
        console.error("=================================");
        console.error(error.message);
        console.error("=================================");

        process.exit(1);
    }
};

startServer();