import { logger } from "@tw050x.net.library/logger"
import { Message } from "@tw050x.net.library/queue";

/**
 * Handles a UserRegistered event message.
 *
 * @param message - The message containing the UserRegistered event.
 */
export default async function handleUserRegisteredEvent(message: Message): Promise<void> {
  logger.debug('Handling UserRegistered event with body:', message);
}
