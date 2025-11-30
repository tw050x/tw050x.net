import { read as readConfig } from "@tw050x.net.library/configs";
import { logger } from "@tw050x.net.library/logger";
import { Middleware, ServiceRequestContext } from "@tw050x.net.library/service";
import { UseSessionResultingContext } from "./use-session.js";

/**
 * The resulting context for the useRegistrationState middleware.
 */
export type UseSessionGateResultingContext = ServiceRequestContext & {
  incomingMessage: ServiceRequestContext['incomingMessage'] & {
    session: {
      cookie: {
        name: string;
      };
      id: string | null;
      userProfileUuid: string;
    }
  }
}

/**
 * Factory
 */
type Factory = () => Middleware<
  ServiceRequestContext & UseSessionResultingContext,
  UseSessionGateResultingContext
>

/**
 * @returns void
 */
export const useSessionGate: Factory = () => async (context) => {
  if (context.incomingMessage.session.userProfileUuid === undefined) {
    logger.debug('No valid session found, sending 403 Forbidden response');
    return void context.serverResponse.sendSeeOtherRedirect(
      new URL('/login', `https://${readConfig('service.*.host')}`),
    )
  }

  logger.debug('Session gate cookie middleware initialised');
}
