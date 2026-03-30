import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

app.use(cors());
app.use(cookieParser());

app.use(cors({
    origin: process.env.CORS_ORIGIN ,
    credentials: true
}));

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ limit: "16kb", extended: true }));
app.use(express.static("public"));
app.use(cookieParser());

//routes importing
import userRoutes from "./routes/user.routes.js";
import carRoutes from "./routes/car.routes.js";
import documentRoutes from "./routes/document.routes.js";
import maintenanceRoutes from "./routes/maintenance.routes.js";
import reminderRoutes from "./routes/reminder.routes.js";



//routes declaration
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/cars", carRoutes);
app.use("/api/v1/documents", documentRoutes);
app.use("/api/v1/maintenance", maintenanceRoutes);
app.use("/api/v1/reminders", reminderRoutes);


export { app };