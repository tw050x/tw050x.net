import { readParameter } from "@tw050x.net.library/configuration";
import { logger } from "@tw050x.net.library/logger";
import { receiveMessages } from "@tw050x.net.library/queue";
import { default as handleUserRegisteredEvent } from "./event-handler/user-registered.js";

const eventQueueUrl = await readParameter('user.service.event-queue-url');

let receivedExitSignal = false;

const cleanup =  () => {
  logger.info('Received SIGINT, shutting down gracefully...');
  receivedExitSignal = true;
}

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);

try {
  for await (const { deleteMessage, message } of receiveMessages(eventQueueUrl)) {
    logger.debug('Received message:', message);
    if (receivedExitSignal) {
      logger.debug('Exiting after receiving exit signal.');
      break;
    }

    switch (message.MessageAttributes?.MessageType?.StringValue) {
      case 'UserRegistered':
        logger.debug('Processing UserRegistered event:', message.Body);
        await handleUserRegisteredEvent(message);
        await deleteMessage();
        break;
      default:
        logger.warn('Unknown message type:', message.MessageAttributes?.MessageType);
    }
  }
}
catch (error) {
  logger.error('Error processing messages:', error);
}
