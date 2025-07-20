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
Object.defineProperty(exports, "__esModule", { value: true });
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
// Define log levels
var LogLevel;
(function (LogLevel) {
    LogLevel[LogLevel["ERROR"] = 0] = "ERROR";
    LogLevel[LogLevel["WARN"] = 1] = "WARN";
    LogLevel[LogLevel["INFO"] = 2] = "INFO";
    LogLevel[LogLevel["HTTP"] = 3] = "HTTP";
    LogLevel[LogLevel["DEBUG"] = 4] = "DEBUG";
})(LogLevel || (LogLevel = {}));
// Define colors for console output
const colors = {
    error: "\x1b[31m", // Red
    warn: "\x1b[33m", // Yellow
    info: "\x1b[32m", // Green
    http: "\x1b[35m", // Magenta
    debug: "\x1b[37m", // White
    reset: "\x1b[0m", // Reset
};
class Logger {
    constructor() {
        this.logLevel =
            process.env.NODE_ENV === "production" ? LogLevel.WARN : LogLevel.DEBUG;
        this.logsDir = path.join(process.cwd(), "logs");
        this.ensureLogsDirectory();
    }
    ensureLogsDirectory() {
        if (!fs.existsSync(this.logsDir)) {
            fs.mkdirSync(this.logsDir, { recursive: true });
        }
    }
    formatMessage(level, message, meta) {
        const timestamp = new Date().toISOString();
        let logMessage = `[${timestamp}] [${level.toUpperCase()}]: ${message}`;
        if (meta && Object.keys(meta).length > 0) {
            logMessage += ` ${JSON.stringify(meta)}`;
        }
        return logMessage;
    }
    writeToFile(level, message) {
        const today = new Date().toISOString().split("T")[0];
        const logFile = path.join(this.logsDir, `combined-${today}.log`);
        const errorFile = path.join(this.logsDir, `error-${today}.log`);
        const logEntry = message + "\n";
        // Write to combined log
        fs.appendFileSync(logFile, logEntry);
        // Write errors to separate file
        if (level === "error") {
            fs.appendFileSync(errorFile, logEntry);
        }
    }
    log(level, levelNum, message, meta) {
        if (levelNum > this.logLevel)
            return;
        const formattedMessage = this.formatMessage(level, message, meta);
        // Console output with colors
        const color = colors[level] || colors.reset;
        console.log(`${color}${formattedMessage}${colors.reset}`);
        // File output
        this.writeToFile(level, formattedMessage);
    }
    error(message, meta) {
        this.log("error", LogLevel.ERROR, message, meta);
    }
    warn(message, meta) {
        this.log("warn", LogLevel.WARN, message, meta);
    }
    info(message, meta) {
        this.log("info", LogLevel.INFO, message, meta);
    }
    http(message, meta) {
        this.log("http", LogLevel.HTTP, message, meta);
    }
    debug(message, meta) {
        this.log("debug", LogLevel.DEBUG, message, meta);
    }
}
// Export singleton instance
const logger = new Logger();
exports.default = logger;
