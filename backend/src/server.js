import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.js";
import workerRoutes from "./routes/workers.js";
import attendanceRoutes from "./routes/attendance.js";
import departmentRoutes from "./routes/departments.js";
import adminRoutes from "./routes/admin.js";
import { getDatabase } from "./db/db.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(
  cors({
    origin: true, // Reflect the requesting origin dynamically to allow credentials
    credentials: true,
  }),
);
app.use(express.json({ limit: "10mb" })); // Support larger JSON bodies for photo snapshots
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Health Check
app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    message: "Worker Status Management System API is healthy.",
  });
});

// Initialize Database on startup
try {
  console.log("Checking and initializing database...");
  const db = getDatabase();
  console.log(
    `Database ready. Loaded ${db.workers.length} workers, ${db.users.length} users.`,
  );
} catch (e) {
  console.error("Database initialization failed", e);
}

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/workers", workerRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/departments", departmentRoutes);
app.use("/api/admin", adminRoutes);

// Error Handling Middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res
    .status(500)
    .json({ error: "Internal Server Error", message: err.message });
});

// Start Server
app.listen(PORT, "0.0.0.0", () => {
  console.log(`[Server] Running on port http://127.0.0.1:${PORT}`);
});
