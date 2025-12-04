import { UseLoginStateResultingContext } from "../middleware/use-login-state.js";
import { read as readConfig } from "../helper/configs.js";
import { logger } from "../helper/logger.js";
import { Middleware } from "../middleware.js";
import { ServiceRequestContext } from "../types.js";
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
  ServiceRequestContext & UseSessionResultingContext & UseLoginStateResultingContext,
  UseSessionGateResultingContext
>

/**
 * @returns void
 */
export const useSessionGate: Factory = () => async (context) => {
  if (context.incomingMessage.session.userProfileUuid === undefined) {
    logger.debug('No valid session found, redirecting to login page');

    // Set return URL cookie
    context.serverResponse.loginState.cookie.set(
      JSON.stringify({
        returnUrl: new URL(context.incomingMessage.url || '/', `https://${readConfig('service.*.host')}`).toString(),
      })
    )

    // Redirect to login page
    return void context.serverResponse.sendSeeOtherRedirect(
      new URL('/login', `https://${readConfig('service.*.host')}`),
    )
  }

  logger.debug('Session gate cookie middleware initialised');
}
