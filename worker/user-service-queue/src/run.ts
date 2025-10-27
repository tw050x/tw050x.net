import { readParameter } from "@tw050x.net.library/configuration";
import { logger } from "@tw050x.net.library/logger";
import { receiveMessages } from "@tw050x.net.library/queue";

const eventQueueUrl = await readParameter('user.service.event-queue-url');

let receivedExitSignal = false;

const cleanup =  () => {
  logger.info('Received SIGINT, shutting down gracefully...');
}

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);

try {
  for await (using message of receiveMessages(eventQueueUrl)) {
    if (receivedExitSignal) {
      break;
    }

    logger.debug('Received message:', message.Body);
  }

  // TODO: add handling of provided event types
}
catch (error) {
  logger.error('Error processing messages:', error);
}
