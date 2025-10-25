import { readParameter } from "@tw050x.net.library/configuration";
import { logger } from "@tw050x.net.library/logger";
import { receiveMessages } from "@tw050x.net.library/queue";

const eventQueueUrl = await readParameter('user.service.event-queue-url');

try {
  for await (const message of receiveMessages(eventQueueUrl)) {
    logger.debug('Received message:', message);
  }
}
catch (error) {
  logger.error('Error processing messages:', error);
}
