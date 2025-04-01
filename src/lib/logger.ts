// src/lib/logger.ts
import winston from "winston";

const logger = winston.createLogger({
  level: "info", // Set log level to 'info', 'warn', 'error', etc.
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.simple()
  ),
  transports: [
    // Console transport
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      ),
    }),

    // File transport (optional)
    new winston.transports.File({
      filename: "logs/app.log",
      level: "info",
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      ),
    }),
  ],
});

export default logger;
