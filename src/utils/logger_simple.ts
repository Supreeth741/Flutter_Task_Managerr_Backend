// Simplified console-only logger
enum LogLevel {
  ERROR = 0,
  WARN = 1,
  INFO = 2,
  HTTP = 3,
  DEBUG = 4,
}

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
  private logLevel: LogLevel;

  constructor() {
    this.logLevel =
      process.env.NODE_ENV === "production" ? LogLevel.WARN : LogLevel.DEBUG;
  }

  private formatMessage(level: string, message: string, meta?: any): string {
    const timestamp = new Date().toISOString();
    let logMessage = `[${timestamp}] [${level.toUpperCase()}]: ${message}`;

    if (meta && Object.keys(meta).length > 0) {
      logMessage += ` ${JSON.stringify(meta)}`;
    }

    return logMessage;
  }

  private log(
    level: string,
    levelNum: LogLevel,
    message: string,
    meta?: any
  ): void {
    if (levelNum > this.logLevel) return;

    const formattedMessage = this.formatMessage(level, message, meta);

    // Console output with colors
    const color = colors[level as keyof typeof colors] || colors.reset;
    console.log(`${color}${formattedMessage}${colors.reset}`);
  }

  error(message: string, meta?: any): void {
    this.log("error", LogLevel.ERROR, message, meta);
  }

  warn(message: string, meta?: any): void {
    this.log("warn", LogLevel.WARN, message, meta);
  }

  info(message: string, meta?: any): void {
    this.log("info", LogLevel.INFO, message, meta);
  }

  http(message: string, meta?: any): void {
    this.log("http", LogLevel.HTTP, message, meta);
  }

  debug(message: string, meta?: any): void {
    this.log("debug", LogLevel.DEBUG, message, meta);
  }
}

// Export singleton instance
const logger = new Logger();
export default logger;
