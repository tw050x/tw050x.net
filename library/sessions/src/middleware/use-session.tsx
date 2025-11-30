import { database as sessionsDatabase } from "@tw050x.net.database/sessions";
import { read as readConfig } from "@tw050x.net.library/configs";
import { sanitizeMongoDBFilterOrPipeline } from "@tw050x.net.library/database";
import { logger } from "@tw050x.net.library/logger";
import { Middleware, ServiceRequestContext } from "@tw050x.net.library/service";
import { default as Unrecoverable } from "@tw050x.net.library/uikit/document/Unrecoverable";
import { default as Cookies } from "cookies";
import { sessionsEventQueue } from "../queue/sessions-event-queue.js";

// The name of the registration state cookie
const sessionCookieName = 'user.session';

/**
 *
 */
type UseSessionsOptions = {
  activity: string;
}

/**
 * The resulting context for the useRegistrationState middleware.
 */
export type UseSessionResultingContext = ServiceRequestContext & {
  incomingMessage: ServiceRequestContext['incomingMessage'] & {
    session: {
      cookie: {
        name: string;
      };
      id: string | null;
      userProfileUuid?: string;
    }
  }
  serverResponse: ServiceRequestContext['serverResponse'] & {
    session: {
      cookie: {
        clear: () => void;
      }
    }
  }
}

/**
 * Factory
 */
type Factory = (options: UseSessionsOptions) => Middleware<
  ServiceRequestContext,
  UseSessionResultingContext
>

/**
 * @returns void
 */
export const useSession: Factory = (options) => async (context) => {

  // log user session activity
  try {
    sessionsEventQueue.add('SessionActivity', {
      activity: options.activity,
      timestamp: new Date(),
    });
  }
  catch (error) {
    logger.error(error);
    logger.debug('Failed to log user session activity');
    // not a fatal error so continue
  }

  const cookies = new Cookies(context.incomingMessage, context.serverResponse, {
    secure: true,
  });

  // read the session ID from the cookie
  let id = cookies.get(sessionCookieName) || null;

  // look up the session in the database
  let userProfileUuid;
  sessionGuard: {
    if (id === null) {
      logger.debug('Session cookie not found');
      break sessionGuard;
    }

    // look up the session in the database
    let record;
    try {
      record = await sessionsDatabase.logins.findOne(
        sanitizeMongoDBFilterOrPipeline({
          id,
        })
      );
    }
    catch (error) {
      logger.error(error);
      logger.debug('Failed to look up session in database');
      return void context.serverResponse.sendInternalServerErrorHTMLResponse(
        <Unrecoverable />
      );
    }

    // check if the session was found
    if (record === null) {
      logger.debug('Session not found in database');
      break sessionGuard;
    }

    // session is valid so set the user profile UUID
    userProfileUuid = record.userProfileUuid;
  }

  //
  const clearSessionCookie = () => {
    cookies.set(sessionCookieName, '', {
      domain: readConfig('cookie.*.domain'),
      httpOnly: false,
      maxAge: 0,
      path: '/',
      sameSite: 'lax',
      secure: true,
    });
  }

  // initialize the cookies object on the incoming message
  context.incomingMessage.session = {
    cookie: {
      name: sessionCookieName
    },
    id,
    userProfileUuid,
  };
  context.serverResponse.session = {
    cookie: {
      clear: clearSessionCookie
    }
  };
  logger.debug('Session cookie middleware initialized');
}
