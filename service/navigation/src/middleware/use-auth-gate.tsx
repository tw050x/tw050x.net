import { AccessTokenCookie, UseAccessTokenCookieResultingContext } from "@tw050x.net.library/authentication/middleware/use-access-token-cookie";
import { UseLoginStateCookieResultingContext } from "@tw050x.net.library/authentication/middleware/use-login-state-cookie";
import { logger } from "@tw050x.net.library/logger";
import { Middleware, ServiceRequestContext } from "@tw050x.net.library/service";
import { default as ForbiddenDocument } from "@tw050x.net.library/uikit/document/Forbidden";
import { default as UnrecoverableDocument } from "@tw050x.net.library/uikit/document/Unrecoverable";
import { serviceParameters } from "../parameters.js";

/**
 * Resulting context after the auth gate middleware has run
 */
export type AuthGateResultingContext = ServiceRequestContext & {
  incomingMessage: ServiceRequestContext['incomingMessage'] & {
    accessTokenCookie: {
      authorised: true;
      errors: AccessTokenCookie['errors'];
      payload: {
        sub: string;
        uid?: string;
      };
    }
  }
}

/**
 *
 */
type Factory = () => Middleware<
  ServiceRequestContext & UseAccessTokenCookieResultingContext & UseLoginStateCookieResultingContext,
  AuthGateResultingContext
>;

/**
 * Middleware to perform default authentication and authorization checks.
 *
 * @returns an unrecoverable error page if an error occurred during auth token verification
 * @returns a forbidden page if the user is not authorized
 * @redirects to the login page if the user is not authenticated
 */
export const useAuthGate: Factory = () => async (context) => {
  if (context.incomingMessage.accessTokenCookie.errors.length > 0) {
    context.incomingMessage.accessTokenCookie.errors.forEach((error) => logger.error(error));
    return void context.serverResponse.sendInternalServerErrorHTMLResponse(<UnrecoverableDocument />);
  }

  // If the user is not authorized, return a forbidden response
  if (context.incomingMessage.accessTokenCookie.authorised === false) {
    return void context.serverResponse.sendUnauthorizedHTMLResponse(<ForbiddenDocument />);
  }

  // If the user is not authorized, redirect to the login page
  if (context.incomingMessage.accessTokenCookie.authorised === null) {
    logger.debug('User is not authorized, redirecting to login page');

    const portalServiceHost = serviceParameters.getParameter('navigation.service.host');
    if (!portalServiceHost) {
      logger.error('No portal host configured, cannot redirect to login page');
      return void context.serverResponse.sendInternalServerErrorHTMLResponse(<UnrecoverableDocument />);
    }

    context.serverResponse.loginStateCookie.set(JSON.stringify({
      returnUrl: new URL(context.incomingMessage.url || '/', `https://${portalServiceHost}`),
    }))
    return void context.serverResponse.sendMovedTemporarilyRedirect(
      new URL('/login', `https://${portalServiceHost}`),
    );
  }
}
