import { logger } from "@tw050x.net.library/logger";
import { defineServer } from "@tw050x.net.library/service";
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const server = defineServer({
  port: 3000,
  routesDirectory: resolve(__dirname, 'stack'),
  sslOptions: {
    crtPath: resolve(__dirname, '..', '..', '..', 'certificates', 'marketing.crt'),
    keyPath: resolve(__dirname, '..', '..', '..', 'certificates', 'marketing.key'),
  },
});

server.listen(() => {
  logger.info('Server is listening on port 3000');
});

process.on('SIGINT', () => {
  logger.info('Received SIGINT, shutting down gracefully...');
  server.close();
});

process.on('SIGTERM', () => {
  logger.info('Received SIGTERM, shutting down gracefully...');
  server.close();
});

process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  server.close();
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
  server.close();
});
