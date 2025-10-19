import { resolve } from "node:path";
import { createLogger, format, transports } from "winston";

export const logger = createLogger({
  level: process.env.LOGS_LEVEL || 'info',
  format: format.combine(
    format.errors({ stack: true }),
    format.timestamp(),
    format.json()
  ),
  transports: [
    new transports.File({ filename: resolve(process.env.LOGS_DIRECTORY || '/log', 'combined.log') }),
    new transports.File({ filename: resolve(process.env.LOGS_DIRECTORY || '/log', 'error.log'), level: 'error' }),
  ]
});

// Setup console logging for non production environments
if (process.env.NODE_ENV !== 'production') {
  logger.add(
    new transports.Console({
      format: format.combine(
        format.errors({ stack: true }),
        format.simple(),
      ),
      level: 'debug',
    })
  );
}
