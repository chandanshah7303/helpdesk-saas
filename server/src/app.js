import express from "express";
import cors from "cors";

import logger from "./middleware/logger.js";

import organizationRoutes from "./modules/organizations/organization.route.js";
import authRoutes from "./modules/auth/auth.route.js";
import userRoutes from "./modules/users/user.route.js";
import categoryRoutes from "./modules/categories/category.route.js";
import ticketRoutes from "./modules/tickets/ticket.route.js";
import commentRoutes from "./modules/comments/comment.route.js";
import auditLogRoutes from "./modules/auditLogs/auditLog.route.js";
import dashboardRoutes from "./modules/dashboard/dashboard.route.js";

import { errorMiddleware } from "./middleware/error.middleware.js";

const app = express();

// Global Middleware
app.use(express.json());
app.use(logger);
app.use(cors());
// app.use(
//   cors({
//     origin: process.env.CLIENT_ORIGIN,
//     credentials: true,
//   })
// );

// Routes
app.use("/api/organizations", organizationRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api", categoryRoutes);
app.use("/api/tickets", ticketRoutes);
app.use("/api", commentRoutes);
app.use("/api", auditLogRoutes);
app.use("/api/dashboard", dashboardRoutes);

// Health Check
app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Server is running successfully",
  });
});

// Error Middleware — MUST BE LAST
app.use(errorMiddleware);

export default app;
