"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = __importDefault(require("./routes/auth"));
const response_1 = require("./utils/response");
const logger_1 = __importDefault(require("./utils/logger"));
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3000;
// Middleware for request logging
app.use((req, res, next) => {
    const requestId = Date.now().toString() + Math.random().toString(36).substr(2, 9);
    res.locals.requestId = requestId;
    logger_1.default.http(`${req.method} ${req.path}`, {
        requestId,
        ip: req.ip,
        userAgent: req.get("User-Agent"),
    });
    next();
});
app.use(express_1.default.json());
// Health check endpoint
app.get("/health", (req, res) => {
    logger_1.default.info("Health check requested");
    return response_1.ResponseHandler.success(res, "Server is healthy", {
        status: "OK",
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || "development",
    });
});
app.get("/", (req, res) => {
    logger_1.default.info("Root endpoint accessed");
    return response_1.ResponseHandler.success(res, "Task Manager Backend API", {
        message: "Welcome to Task Manager Backend!",
        version: "1.0.0",
        endpoints: {
            health: "/health",
            auth: "/auth",
        },
    });
});
// API Routes
app.use("/auth", auth_1.default);
// 404 handler - Simplified approach
app.use((req, res, next) => {
    logger_1.default.warn(`Route not found: ${req.method} ${req.originalUrl}`, {
        requestId: res.locals.requestId,
    });
    return response_1.ResponseHandler.notFound(res, `Route ${req.originalUrl} not found`);
});
// Global error handler
app.use((error, req, res, next) => {
    logger_1.default.error("Unhandled error", {
        requestId: res.locals.requestId,
        error: error.message,
        stack: error.stack,
        method: req.method,
        url: req.url,
    });
    return response_1.ResponseHandler.error(res, "Internal server error", process.env.NODE_ENV === "development" ? error.message : undefined);
});
app.listen(PORT, () => {
    logger_1.default.info(`🚀 Task Manager Backend running on port ${PORT}`);
    logger_1.default.info(`Environment: ${process.env.NODE_ENV || "development"}`);
    logger_1.default.info(`Health check: http://localhost:${PORT}/health`);
});
