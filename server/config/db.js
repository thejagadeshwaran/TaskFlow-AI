const mongoose = require("mongoose");

const connectDB = async () => {
    try {
        console.log("=================================");
        console.log("🔄 Connecting to MongoDB...");
        console.log("=================================");

        mongoose.set("bufferCommands", false);

        const connection = await mongoose.connect(
            process.env.MONGODB_URI,
            {
                serverSelectionTimeoutMS: 10000,
                socketTimeoutMS: 45000,
            }
        );

        console.log("=================================");
        console.log("✅ MongoDB CONNECTED");
        console.log("=================================");
        console.log(
            "Host:",
            connection.connection.host
        );
        console.log(
            "Database:",
            connection.connection.name
        );
        console.log(
            "Ready State:",
            mongoose.connection.readyState
        );
        console.log("=================================");

        mongoose.connection.on("connected", () => {
            console.log("🟢 MongoDB event: connected");
        });

        mongoose.connection.on("error", (error) => {
            console.error(
                "🔴 MongoDB event error:",
                error.message
            );
        });

        mongoose.connection.on("disconnected", () => {
            console.error(
                "🔴 MongoDB event: disconnected"
            );
        });

        return connection;

    } catch (error) {
        console.error("=================================");
        console.error("❌ MongoDB CONNECTION FAILED");
        console.error("=================================");
        console.error(error.message);
        console.error("=================================");

        throw error;
    }
};

module.exports = connectDB;