import { logger } from "@tw050x.net.library/platform/helper/logger";

/**
 * Handles a UserRegistered event message.
 *
 * @param messageBody - The message body for the UserRegistered event.
 */
export default async function handleSessionActivityEvent(messageBody: Record<string, unknown>): Promise<void> {
  logger.debug('Handling SessionActivity message');
}
