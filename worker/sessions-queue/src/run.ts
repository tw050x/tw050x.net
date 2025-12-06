import { read as readConfig } from "@tw050x.net.library/platform/helper/configs";
import { logger } from "@tw050x.net.library/platform/helper/logger";
import { writeFileSync } from "node:fs";
import { Job, Worker, WorkerOptions } from "bullmq";
import { default as handleUserRegisteredEvent } from "./event-handler/session-activity.js";
import { default as healthcheck } from "./healthcheck.js";

let unrecoverableErrorOccured = false;

const workerOptions: WorkerOptions = {
  connection: {
    host: 'sessions-redis.internal',
  },
};

const worker = new Worker(
  readConfig('service.sessions.event-queue-name'),
  async (job: Job) => {
    switch (job.name) {
      case 'UserRegistered':
        return await handleUserRegisteredEvent(job.data);
      default:
        throw new Error(`Unknown message type: ${job.name}`);
    }
  },
  workerOptions,
);

const cleanup =  () => {
  healthcheck.stop();
  worker.close();
}

worker.on('error', (error) => {
  cleanup();
  logger.error(error);
  logger.debug('Worker error occurred, shutting down...');
  process.exit(1);
});

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
