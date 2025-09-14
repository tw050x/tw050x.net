import { logger } from "@tw050x.net.library/logger";
import { ServiceContext } from "@tw050x.net.library/service";
import { sendMovedTemporarilyRedirect } from "@tw050x.net.library/service/helper/redirect/send-moved-temporarily-redirect";
import { sendUnauthorizedHTMLResponse } from "@tw050x.net.library/service/helper/response/send-unauthorized-html-response";
import { sendInternalServerErrorHTMLResponse } from "@tw050x.net.library/service/helper/response/send-internal-server-error-html-response";
import { default as ForbiddenDocument } from "@tw050x.net.library/uikit/document/Forbidden";
import { default as UnrecoverableDocument } from "@tw050x.net.library/uikit/document/Unrecoverable";

/**
 * Middleware to perform default authentication and authorization checks.
 *
 * @returns an unrecoverable error page if an error occurred during auth token verification
 * @returns a forbidden page if the user is not authorized
 * @redirects to the login page if the user is not authenticated
 */
export const authGate = () => async (context: ServiceContext) => {
  if (context.incomingMessage.accessTokenCookie.errors.length > 0) {
    context.incomingMessage.accessTokenCookie.errors.forEach((error) => logger.error('an error occurred during auth token verification', { error }));
    return void sendInternalServerErrorHTMLResponse(context, await <UnrecoverableDocument />);
  }

  // If the user is not authorized, return a forbidden response
  if (context.incomingMessage.accessTokenCookie.authorised === false) {
    return void sendUnauthorizedHTMLResponse(context, await <ForbiddenDocument />);
  }

  // If the user is not authorized, redirect to the login page
  if (context.incomingMessage.accessTokenCookie.authorised === null) {
    logger.debug('User is not authorized, redirecting to login page');
    context.serverResponse.loginStateCookie.set(JSON.stringify({
      returnUrl: new URL(context.incomingMessage.url || '/', `https://${context.configuration.get('portal.service.host')}`),
    }))
    return void sendMovedTemporarilyRedirect(
      context,
      new URL('/login', `https://${context.configuration.get('portal.service.host')}`),
    );
  }
}
