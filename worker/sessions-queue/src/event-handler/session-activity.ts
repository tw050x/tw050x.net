import { database as sessionsDatabase } from "@tw050x.net.library/database/collections/sessions";
import { logger } from "@tw050x.net.library/platform/helper/logger";
import { z } from "zod";

// Message body schema
const messageBodySchema = z.object({
  activity: z.string(),
  activityAt: z.coerce.date(),
  sessionsLoginsUuid: z.string(),
  userProfileUuid: z.string(),
})

/**
 * Handles a SessionActivity event message.
 *
 * @param messageBody - The message body for the SessionActivity event.
 */
export default async function handleSessionActivityEvent(messageBody: Record<string, unknown>): Promise<void> {
  logger.debug('Handling SessionActivity message');

  // Validate message body
  let activity;
  let activityAt;
  let sessionsLoginsUuid;
  let userProfileUuid;
  try {
    const result = messageBodySchema.parse(messageBody);
    activity = result.activity;
    activityAt = result.activityAt;
    sessionsLoginsUuid = result.sessionsLoginsUuid;
    userProfileUuid = result.userProfileUuid;
  }
  catch (error) {
    logger.error(error);
    logger.debug('Invalid SessionActivity message body');
    throw new Error('Invalid SessionActivity message body');
  }
  logger.debug(`Recording activity for session login UUID: ${sessionsLoginsUuid}`);

  // Insert activity record
  try {
    await sessionsDatabase.activity.insertOne({
      activity,
      activityAt,
      createdAt: new Date(),
      loginUuid: sessionsLoginsUuid,
      userProfileUuid,
    });
  }
  catch (error) {
    logger.error(error);
    logger.debug('Failed to record session activity');
    throw new Error('Failed to record session activity');
  }
}
