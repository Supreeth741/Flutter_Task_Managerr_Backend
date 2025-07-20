import express from "express";
import authRouter from "./routes/auth";
import { ResponseHandler } from "./utils/response";
import logger from "./utils/logger_simple";
import { runMigrations } from "./db/migrate";

const app = express();
const PORT = process.env.PORT || 3000;

// Run migrations on startup
async function initializeApp() {
  try {
    logger.info("Initializing application...");
    await runMigrations();
    logger.info("Application initialization completed");
  } catch (error) {
    logger.error("Failed to initialize application", {
      error: error instanceof Error ? error.message : error,
    });
    process.exit(1);
  }
}

// Middleware for request logging
app.use((req, res, next) => {
  const requestId =
    Date.now().toString() + Math.random().toString(36).substr(2, 9);
  res.locals.requestId = requestId;

  logger.http(`${req.method} ${req.path}`, {
    requestId,
    ip: req.ip,
    userAgent: req.get("User-Agent"),
  });

  next();
});

app.use(express.json());

// Health check endpoint
app.get("/health", (req, res) => {
  logger.info("Health check requested");
  return ResponseHandler.success(res, "Server is healthy", {
    status: "OK",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || "development",
  });
});

app.get("/", (req, res) => {
  logger.info("Root endpoint accessed");
  return ResponseHandler.success(res, "Task Manager Backend API", {
    message: "Welcome to Task Manager Backend!",
    version: "1.0.0",
    endpoints: {
      health: "/health",
      auth: "/auth",
    },
  });
});

// API Routes
app.use("/auth", authRouter);

// 404 handler - Simplified approach
app.use((req, res, next) => {
  logger.warn(`Route not found: ${req.method} ${req.originalUrl}`, {
    requestId: res.locals.requestId,
  });
  return ResponseHandler.notFound(res, `Route ${req.originalUrl} not found`);
});

// Global error handler
app.use(
  (
    error: Error,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    logger.error("Unhandled error", {
      requestId: res.locals.requestId,
      error: error.message,
      stack: error.stack,
      method: req.method,
      url: req.url,
    });

    return ResponseHandler.error(
      res,
      "Internal server error",
      process.env.NODE_ENV === "development" ? error.message : undefined
    );
  }
);

app.listen(PORT, async () => {
  logger.info(`🚀 Task Manager Backend starting on port ${PORT}`);
  logger.info(`Environment: ${process.env.NODE_ENV || "development"}`);

  // Initialize the application (run migrations)
  await initializeApp();

  logger.info(`✅ Server ready at http://localhost:${PORT}`);
  logger.info(`Health check: http://localhost:${PORT}/health`);
});
