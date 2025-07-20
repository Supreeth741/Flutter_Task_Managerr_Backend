import { Router, Request, Response, NextFunction } from "express";
import { SignUpBody } from "../utils/types/auth.types";
import { db } from "../db/db_config";
import { users, type NewUser } from "../db/schema";
import { eq } from "drizzle-orm";
import * as bcrypt from "bcrypt";
import logger from "../utils/logger_simple";
import { ResponseHandler } from "../utils/response";

const authRouter = Router();

// Middleware for request logging
const logRequest = (req: Request, res: Response, next: NextFunction) => {
  const requestId =
    Date.now().toString() + Math.random().toString(36).substr(2, 9);
  res.locals.requestId = requestId;

  logger.info(`${req.method} ${req.path}`, {
    requestId,
    ip: req.ip,
    userAgent: req.get("User-Agent"),
    body: req.method !== "GET" ? req.body : undefined,
  });

  next();
};

authRouter.use(logRequest);

authRouter.get("/", (req: Request, res: Response) => {
  logger.info("Authentication endpoint accessed");
  return ResponseHandler.success(res, "Authentication endpoint is active", {
    endpoints: [
      { method: "POST", path: "/signup", description: "User registration" },
      { method: "POST", path: "/login", description: "User login" },
    ],
  });
});

authRouter.post(
  "/signup",
  async (req: Request<{}, {}, SignUpBody>, res: Response) => {
    try {
      const { name, email, password }: SignUpBody = req.body;

      // Validation
      if (!name || !email || !password) {
        logger.warn("Missing required fields", {
          requestId: res.locals.requestId,
          provided: { name: !!name, email: !!email, password: !!password },
        });
        return ResponseHandler.validationError(res, "All fields are required", {
          name: !name ? "Name is required" : undefined,
          email: !email ? "Email is required" : undefined,
          password: !password ? "Password is required" : undefined,
        });
      }

      // Email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        logger.warn("Invalid email format", {
          requestId: res.locals.requestId,
          email,
        });
        return ResponseHandler.validationError(res, "Invalid email format");
      }

      // Password validation
      if (password.length < 6) {
        logger.warn("Password too short", {
          requestId: res.locals.requestId,
        });
        return ResponseHandler.validationError(
          res,
          "Password must be at least 6 characters long"
        );
      }

      logger.info("Starting user registration process", {
        requestId: res.locals.requestId,
        email: email,
      });

      // Check if user already exists
      const existingUser = await db
        .select()
        .from(users)
        .where(eq(users.email, email))
        .limit(1);

      if (existingUser.length > 0) {
        logger.warn("User already exists", {
          requestId: res.locals.requestId,
          email: email,
        });
        return ResponseHandler.error(
          res,
          "User with this email already exists",
          undefined,
          409
        );
      }

      // Hash password
      logger.info("Hashing password", {
        requestId: res.locals.requestId,
      });
      const saltRounds = 12;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      // Create new user
      const newUser: NewUser = {
        name,
        email,
        password: hashedPassword,
      };

      logger.info("Creating new user in database", {
        requestId: res.locals.requestId,
        email: email,
      });

      const [createdUser] = await db.insert(users).values(newUser).returning({
        id: users.id,
        name: users.name,
        email: users.email,
        createdAt: users.createdAt,
      });

      logger.info("User created successfully", {
        requestId: res.locals.requestId,
        userId: createdUser.id,
        email: createdUser.email,
      });

      return ResponseHandler.success(
        res,
        "User registered successfully",
        {
          user: {
            id: createdUser.id,
            name: createdUser.name,
            email: createdUser.email,
            createdAt: createdUser.createdAt,
          },
        },
        201
      );
    } catch (error) {
      logger.error("Signup error", {
        requestId: res.locals.requestId,
        error: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : undefined,
      });

      return ResponseHandler.error(
        res,
        "Failed to create user",
        process.env.NODE_ENV === "development"
          ? error instanceof Error
            ? error.message
            : "Unknown error"
          : undefined
      );
    }
  }
);

// Login endpoint placeholder
authRouter.post("/login", async (req: Request, res: Response) => {
  logger.info("Login attempt", {
    requestId: res.locals.requestId,
    email: req.body.email,
  });

  return ResponseHandler.success(res, "Login endpoint - Coming soon", {
    message: "Login functionality will be implemented here",
  });
});

export default authRouter;
