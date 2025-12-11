import { sanitizeFilter, trusted } from "@tw050x.net.library/database/helper";
import { LoginsDocument, database as sessionsDatabase } from "@tw050x.net.library/database/collections/sessions";
import { logger } from "@tw050x.net.library/platform/helper/logger";
import type { AnyBulkWriteOperation } from "mongodb";

const batchSize = 100;

/**
 * Handles an ExpireSessions event message.
 *
 */
export default async function handleExpireSessionsEvent(): Promise<void> {
  logger.debug('Handling ExpireSessions message');

  //
  const currentDate = new Date();

  // get active sessions (determined by lack of presence of 'expiredAt' field)
  let activeSessionsCursor;
  try {
    activeSessionsCursor = await sessionsDatabase.logins.find(
      sanitizeFilter({
        $and: [
          { expiredAt: trusted({ $exists: false }) },
          { expiresAt: trusted({ $lt: currentDate }) }
        ]
      }),
      {
        sort: { createdAt: 1 },
        batchSize,
      }
    );
  }
  catch (error) {
    logger.error(error);
    logger.debug('Failed to retrieve active sessions');
    throw new Error('Failed to retrieve active sessions');
  }

  if (activeSessionsCursor === null) {
    return void logger.debug('No active sessions to process');
  }

  // Loop through active sessions and expire them
  let operations: Array<AnyBulkWriteOperation<LoginsDocument>> = [];
  let processed = 0;
  try {
    for await (const activeSession of activeSessionsCursor) {
      logger.debug(`Processing active session UUID: ${activeSession.uuid}`);

      operations.push({
        updateOne: {
          filter: sanitizeFilter({
            expiredAt: trusted({ $exists: false }),
            uuid: activeSession.uuid
          }),
          update: {
            $set: {
              expiredAt: currentDate,
              expiredReason: "timeout-logout",
            },
          },
        },
      });

      // Execute bulk write in batches of 100
      if (operations.length >= batchSize) {
        logger.debug(`Executing bulk write for active sessions. Batch size: ${operations.length}`);
        await sessionsDatabase.logins.bulkWrite(operations, { ordered: false });
        operations = [];
      }

      processed += 1;
      logger.debug(`Processed active sessions: ${processed}`);
    }

    // Final bulk write for any remaining operations
    if (operations.length > 0) {
      logger.debug(`Finalizing processing of active sessions. Remaining operations: ${operations.length}`);
      await sessionsDatabase.logins.bulkWrite(operations, { ordered: false });
    }

    logger.debug(`Finished processing active sessions. Total processed: ${processed}`);
  }
  catch (error) {
    logger.error(error);
    logger.debug('Failed to process active sessions');
    throw new Error('Failed to process active sessions');
  }
}
