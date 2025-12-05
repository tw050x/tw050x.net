import { client as sessionsDatabaseClient, database as sessionsDatabase } from "@tw050x.net.library/database/collections/sessions";
import { randomUUID } from "node:crypto";
import { default as Cookies } from "cookies";
import { addHours, differenceInSeconds } from "date-fns";
import { generateSessionId } from "..//helper/sessions/generate-session-id.js";
import { read as readConfig } from "../helper/configs.js";
import { logger } from "../helper/logger.js";
import { Middleware } from "../middleware.js";
import { ServiceRequestContext } from "../types.js";
import { UseSessionResultingContext } from "./use-session.js"

/**
 * The resulting context for the useRegistrationState middleware.
 */
export type UseSessionInitialiserResultingContext = ServiceRequestContext & {
  serverResponse: ServiceRequestContext['serverResponse'] & {
    sessionInitialiser: {
      initialise: (userProfileUuid: string) => Promise<void>;
    }
  }
}

/**
 * Factory
 */
type Factory = () => Middleware<
  ServiceRequestContext & UseSessionResultingContext,
  UseSessionInitialiserResultingContext
>

/**
 * @returns void
 */
export const useSessionInitialiser: Factory = () => async (context) => {
  const cookies = new Cookies(context.incomingMessage, context.serverResponse, {
    secure: true,
  });

  // define the set function
  const initialise = async (userProfileUuid: string) => {
    const currentDate = new Date();

    // Generate a new session ID
    const id = await generateSessionId();
    const uuid = randomUUID();

    // Start a database session and transaction
    const sessionsDatabaseSession = await sessionsDatabaseClient.startSession()
    sessionsDatabaseSession.startTransaction();

    // Create a new session in the database
    await sessionsDatabase.logins.insertOne({
      createdAt: currentDate,
      id,
      initialIpAddress: 'unknown',
      userProfileUuid,
      uuid,
    });
    await sessionsDatabase.activity.insertOne({
      activity: 'session-created',
      createdAt: currentDate,
      loginUuid: uuid,
      userProfileUuid
    });

    // Commit the transaction and end the database session
    await sessionsDatabaseSession.commitTransaction();
    sessionsDatabaseSession.endSession();

    // Calculate expiry - 24 hours from now
    const expiryDate = addHours(currentDate, 24 * 30);
    const maxAgeInSeconds = differenceInSeconds(expiryDate, currentDate);
    const maxAgeInMilliseconds = maxAgeInSeconds * 1000;

    // Set the cookie
    cookies.set(context.incomingMessage.session.cookie.name, id, {
      domain: readConfig('cookie.*.domain'),
      httpOnly: false,
      maxAge: maxAgeInMilliseconds,
      path: '/',
      sameSite: 'lax',
      secure: true,
    });
  }

  // initialize the cookies object on the incoming message
  context.serverResponse.sessionInitialiser = {
    initialise,
  };
  logger.debug('Session initialiser cookie middleware initialized');
}
