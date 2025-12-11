import { logger } from "@tw050x.net.library/platform/helper/logger";
import { sessionsEventQueue } from "@tw050x.net.library/platform/queue/sessions-event-queue";
import { writeFileSync } from "node:fs";
import { schedule } from "node-cron";
import { default as healthcheck } from "./healthcheck.js";

let unrecoverableErrorOccured = false;

// Expressions
const everyMinute = '* * * * *';

// Tasks
const ExpireSessions = schedule(everyMinute, async () => {
  try {
    logger.debug('Expiring inactive sessions...');
    sessionsEventQueue.add('ExpireSessions', {});
  }
  catch (error) {
    logger.error(error);
    logger.debug('An error occured while expiring inactive sessions.');
  }
});

const cleanup =  () => {
  healthcheck.stop();
  ExpireSessions.stop();
}

process.on('SIGINT', () => {
  cleanup();
  logger.debug('Received SIGINT, shutting down gracefully...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  cleanup();
  logger.debug('Received SIGTERM, shutting down gracefully...');
  process.exit(0);
});

process.on('unhandledRejection', async (reason, promise) => {
  cleanup();
  logger.debug('An Unhandled Rejection Occured');
  logger.error('Reason:', reason);
  logger.error('Promise:', promise);
  process.exit(1);
});

// Healthcheck file updater
setInterval(
  () => writeFileSync('/healthcheck', unrecoverableErrorOccured ? 'unhealthy' : 'healthy'),
  15_000
)
