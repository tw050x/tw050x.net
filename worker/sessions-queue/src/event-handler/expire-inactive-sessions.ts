import { logger } from "@tw050x.net.library/platform/helper/logger";

/**
 * Handles an ExpireInactiveSessions event message.
 *
 */
export default async function handleExpireInactiveSessionsEvent(): Promise<void> {
  logger.debug('Handling ExpireInactiveSessions message');

  // get active sessions (determined by lack of presence of 'expiredAt' field)

  // for each active session, check for recent activity
  // - if no recent activity, set trustLevel to 'low'
  // - if no activity in for a period of time equal to session expiry duration, set 'expiredAt' field to current time
  //
}
