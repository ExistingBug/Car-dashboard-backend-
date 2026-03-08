import dns from "dns";
import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

dns.setServers(["8.8.8.8", "8.8.4.4"]);

const connectDB = async () => {
  if (!process.env.MONGODB_URI) {
    console.error("MONGODB_URI environment variable is not defined");
    process.exit(1);
  }

  try {
    const connectionInstance = await mongoose.connect(
      process.env.MONGODB_URI,
      { dbName: DB_NAME }
    );

    console.log(
      `\n MongoDB connected !!! DB host: ${connectionInstance.connection.host}`
    );
  } catch (error) {
    console.error("MongoDB connection FAILED ❌", error);
    process.exit(1);
  }
};

export default connectDB;