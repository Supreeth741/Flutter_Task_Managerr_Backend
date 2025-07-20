"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const db_config_1 = require("../db/db_config");
const schema_1 = require("../db/schema");
const drizzle_orm_1 = require("drizzle-orm");
const bcrypt = __importStar(require("bcrypt"));
const logger_1 = __importDefault(require("../utils/logger"));
const response_1 = require("../utils/response");
const authRouter = (0, express_1.Router)();
// Middleware for request logging
const logRequest = (req, res, next) => {
    const requestId = Date.now().toString() + Math.random().toString(36).substr(2, 9);
    res.locals.requestId = requestId;
    logger_1.default.info(`${req.method} ${req.path}`, {
        requestId,
        ip: req.ip,
        userAgent: req.get("User-Agent"),
        body: req.method !== "GET" ? req.body : undefined,
    });
    next();
};
authRouter.use(logRequest);
authRouter.get("/", (req, res) => {
    logger_1.default.info("Authentication endpoint accessed");
    return response_1.ResponseHandler.success(res, "Authentication endpoint is active", {
        endpoints: [
            { method: "POST", path: "/signup", description: "User registration" },
            { method: "POST", path: "/login", description: "User login" },
        ],
    });
});
authRouter.post("/signup", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, email, password } = req.body;
        // Validation
        if (!name || !email || !password) {
            logger_1.default.warn("Missing required fields", {
                requestId: res.locals.requestId,
                provided: { name: !!name, email: !!email, password: !!password },
            });
            return response_1.ResponseHandler.validationError(res, "All fields are required", {
                name: !name ? "Name is required" : undefined,
                email: !email ? "Email is required" : undefined,
                password: !password ? "Password is required" : undefined,
            });
        }
        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            logger_1.default.warn("Invalid email format", {
                requestId: res.locals.requestId,
                email,
            });
            return response_1.ResponseHandler.validationError(res, "Invalid email format");
        }
        // Password validation
        if (password.length < 6) {
            logger_1.default.warn("Password too short", {
                requestId: res.locals.requestId,
            });
            return response_1.ResponseHandler.validationError(res, "Password must be at least 6 characters long");
        }
        logger_1.default.info("Starting user registration process", {
            requestId: res.locals.requestId,
            email: email,
        });
        // Check if user already exists
        const existingUser = yield db_config_1.db
            .select()
            .from(schema_1.users)
            .where((0, drizzle_orm_1.eq)(schema_1.users.email, email))
            .limit(1);
        if (existingUser.length > 0) {
            logger_1.default.warn("User already exists", {
                requestId: res.locals.requestId,
                email: email,
            });
            return response_1.ResponseHandler.error(res, "User with this email already exists", undefined, 409);
        }
        // Hash password
        logger_1.default.info("Hashing password", {
            requestId: res.locals.requestId,
        });
        const saltRounds = 12;
        const hashedPassword = yield bcrypt.hash(password, saltRounds);
        // Create new user
        const newUser = {
            name,
            email,
            password: hashedPassword,
        };
        logger_1.default.info("Creating new user in database", {
            requestId: res.locals.requestId,
            email: email,
        });
        const [createdUser] = yield db_config_1.db.insert(schema_1.users).values(newUser).returning({
            id: schema_1.users.id,
            name: schema_1.users.name,
            email: schema_1.users.email,
            createdAt: schema_1.users.createdAt,
        });
        logger_1.default.info("User created successfully", {
            requestId: res.locals.requestId,
            userId: createdUser.id,
            email: createdUser.email,
        });
        return response_1.ResponseHandler.success(res, "User registered successfully", {
            user: {
                id: createdUser.id,
                name: createdUser.name,
                email: createdUser.email,
                createdAt: createdUser.createdAt,
            },
        }, 201);
    }
    catch (error) {
        logger_1.default.error("Signup error", {
            requestId: res.locals.requestId,
            error: error instanceof Error ? error.message : "Unknown error",
            stack: error instanceof Error ? error.stack : undefined,
        });
        return response_1.ResponseHandler.error(res, "Failed to create user", process.env.NODE_ENV === "development"
            ? error instanceof Error
                ? error.message
                : "Unknown error"
            : undefined);
    }
}));
// Login endpoint placeholder
authRouter.post("/login", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    logger_1.default.info("Login attempt", {
        requestId: res.locals.requestId,
        email: req.body.email,
    });
    return response_1.ResponseHandler.success(res, "Login endpoint - Coming soon", {
        message: "Login functionality will be implemented here",
    });
}));
exports.default = authRouter;
