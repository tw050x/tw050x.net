import { logger } from "@tw050x.net.library/logger";
import { createServer } from "@tw050x.net.library/service";
import { resolve } from 'node:path';

const server = createServer({
  routesDirectory: resolve(__dirname, 'stack'),
  port: 3000,
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
