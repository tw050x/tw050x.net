import { logger } from "@tw050x.net.library/logger"
import { default as DisposableMessage } from "@tw050x.net.library/queue";

/**
 * Handles a UserRegistered event message.
 *
 * @param message - The disposable message containing the UserRegistered event.
 */
export default async function handleUserRegisteredEvent(message: DisposableMessage): Promise<void> {
  logger.debug('Handling UserRegistered event with body:', message);
}
