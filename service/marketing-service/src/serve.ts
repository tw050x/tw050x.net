import { logger } from "@tw050x.net.library/logger";
import { defineServer } from "@tw050x.net.library/service";
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { default as healthcheck } from "./healthcheck.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const server = defineServer({
  port: 3000,
  routesDirectory: resolve(__dirname, 'stack'),
  sslOptions: {
    crtPath: resolve(__dirname, '..', '..', '..', 'certificates', 'marketing-service.crt'),
    keyPath: resolve(__dirname, '..', '..', '..', 'certificates', 'marketing-service.key'),
  },
});

server.listen(() => {
  logger.info('Server is listening on port 3000');
});

const cleanup = () => {
  healthcheck.stop();
  server.close();
}

server.on('error', (error) => {
  logger.error(error);
  logger.info('Server error occurred, shutting down...');
  cleanup();
  process.exit(1);
});

process.on('SIGINT', () => {
  logger.info('Received SIGINT, shutting down gracefully...');
  cleanup();
  process.exit(0);
});

process.on('SIGTERM', () => {
  logger.info('Received SIGTERM, shutting down gracefully...');
  cleanup();
  process.exit(0);
});

process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  cleanup();
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise);
  logger.debug(`Reason: ${reason}`);
  cleanup();
  process.exit(1);
});
