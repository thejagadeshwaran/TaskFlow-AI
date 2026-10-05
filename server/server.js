require("dotenv").config();

const server = require("./app");
const connectDB = require("./config/db");

const PORT = process.env.PORT || 5000;

const startServer = async () => {
    try {
        console.log("=================================");
        console.log("🔄 Starting TaskFlow AI...");
        console.log("=================================");

        // Connect MongoDB FIRST
        await connectDB();

        console.log("=================================");
        console.log("✅ Database connection completed");
        console.log("=================================");

        // Start HTTP + Socket.IO server
        server.listen(PORT, () => {
            console.log("=================================");
            console.log("🚀 TaskFlow AI SERVER STARTED");
            console.log("=================================");
            console.log(`🌐 Server: http://localhost:${PORT}`);
            console.log(`🔌 Socket.IO: http://localhost:${PORT}`);
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