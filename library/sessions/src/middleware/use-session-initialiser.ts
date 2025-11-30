import { read as readConfig } from "@tw050x.net.library/configs";
import { logger } from "@tw050x.net.library/logger";
import { Middleware, ServiceRequestContext } from "@tw050x.net.library/service";
import { client as sessionsDatabaseClient, database as sessionsDatabase } from "@tw050x.net.database/sessions";
import { default as Cookies } from "cookies";
import { addHours, differenceInSeconds } from "date-fns";
import { generateSessionId } from "../helper/generate-session-id.js";
import { UseSessionResultingContext } from "./use-session.js"

// The name of the registration state cookie
// const sessionCookieName = 'auth.session';

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

    // Start a database session and transaction
    const sessionsDatabaseSession = await sessionsDatabaseClient.startSession()
    sessionsDatabaseSession.startTransaction();

    // Create a new session in the database
    await sessionsDatabase.logins.insertOne({
      createdAt: currentDate,
      id,
      initialIpAddress: 'unknown',
      userProfileUuid,
    });
    await sessionsDatabase.activity.insertOne({
      activity: 'session-created',
      createdAt: currentDate,
      userProfileUuid
    })

    // Commit the transaction and end the database session
    await sessionsDatabaseSession.commitTransaction();
    sessionsDatabaseSession.endSession();

    // Calculate expiry - 1 hour from now
    const expiryDate = addHours(currentDate, 1);
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
