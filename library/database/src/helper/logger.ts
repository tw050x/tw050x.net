import { resolve } from "node:path";
import { createLogger, format, transports } from "winston";
import { read as readConfig } from "./configs.js"

export const logger = createLogger({
  level: await readConfig('logs.level'),
  format: format.combine(
    format.errors({ stack: true }),
    format.timestamp(),
    format.json()
  ),
  transports: [
    new transports.File({ filename: resolve(await readConfig('logs.directory'), 'combined.log') }),
    new transports.File({ filename: resolve(await readConfig('logs.directory'), 'error.log'), level: 'error' }),
  ]
});

// Setup console logging for non production environments
if (process.env.NODE_ENV !== 'production') {
  logger.add(
    new transports.Console({
      format: format.combine(
        format.errors({ stack: true }),
        format.timestamp(),
        format.printf(({ level, message, timestamp }) => {
          if (level === 'debug') {
            return `${level}: ${message}`;
          }
          return `${level}: ${message} ${timestamp}`;
        }),
      ),
      level: 'debug',
    })
  );
}
