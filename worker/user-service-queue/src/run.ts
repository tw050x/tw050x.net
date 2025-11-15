import { read as readConfig } from "@tw050x.net.library/configs";
import { logger } from "@tw050x.net.library/logger";
import { ConsumerProps, rabbit } from "@tw050x.net.library/queue";
import { default as handleUserRegisteredEvent } from "./event-handler/user-registered.js";

const consumerProps: ConsumerProps = {
  queue: readConfig('service.user.event-queue-name'),
  noAck: false,
};

const consumer = rabbit.createConsumer(consumerProps, async (message: unknown) => {
  // ensure the message is a valid structure
  if (typeof message !== 'object') {
    throw new Error('Invalid message format');
  }
  if (message === null) {
    throw new Error('Invalid message format');
  }
  if (('type' in message) === false) {
    throw new Error('Message type is missing');
  }
  if (typeof message.type !== 'string') {
    throw new Error('Message type must be a string');
  }

  // handle the message type
  switch (message.type) {
    case 'UserRegistered':
        await handleUserRegisteredEvent(message);
        break;
      default:
        logger.debug(`Unknown message type: ${message.type}`);
        throw new Error(`Unknown message type`);
  }
});

const cleanup =  () => {
  consumer.close();
  rabbit.close();
}

consumer.on('error', (error) => {
  cleanup();
  logger.error(error);
  logger.debug('Consumer error occurred, shutting down...');
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
