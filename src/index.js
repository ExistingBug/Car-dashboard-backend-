// dotenv loaded via --import dotenv/config flag in package.json dev script
import express from "express";
import connectDB from "./db/index.js"; // our connection helper

const app = express();

// wrap startup in async function so we can await DB connection
const startServer = async () => {
    try {
        // establish MongoDB connection
        await connectDB();

        // handle application-level errors
        app.on("error", (error) => {
            console.error("App error:", error);
            throw error;
        });

        app.listen(process.env.PORT, () => {
            console.log(`app is listening on port ${process.env.PORT}`);
        });
    } catch (error) {
        console.error("ERROR:", error);
        process.exit(1);
    }
};

startServer();
