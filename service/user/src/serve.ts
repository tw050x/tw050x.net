import { logger } from "@tw050x.net.library/platform/helper/logger";
import { default as defineServer } from "@tw050x.net.library/platform/service";
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { default as healthcheck } from "./healthcheck.js";
import { default as routes } from "./routes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const server = defineServer({
  port: 3000,
  routes,
  sslOptions: {
    crtPath: resolve(__dirname, '..', '..', '..', 'certificates', 'user.crt'),
    keyPath: resolve(__dirname, '..', '..', '..', 'certificates', 'user.key'),
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
