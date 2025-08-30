import { useAccessTokenCookieReader } from "@tw050x.net/middleware/use-access-token-cookie-reader";
import { useLoginStateCookieWriter } from "@tw050x.net/middleware/use-login-state-cookie-writer";
import { useCors } from "@tw050x.net/middleware/use-cors";
import { default as logger } from "@tw050x.net/logger";
import { defineServiceMiddleware } from "@tw050x.net/service";
import { sendInternalServerErrorHTMLResponse, sendMovedTemporarilyRedirect, sendOKHTMLResponse, sendUnauthorizedHTMLResponse } from "@tw050x.net/service/helper";
import { default as ForbiddenDocument } from "@tw050x.net/uikit/document/Forbidden";
import { default as UnrecoverableDocument } from "@tw050x.net/uikit/document/Unrecoverable";
import { default as DashboardDocument } from "../../../template/document/Dashboard";

export default defineServiceMiddleware([
  async (context) => {
    logger.debug(`GET ${context.incomingMessage.url}`);
  },
  useCors({
    getConfiguration: async (configuration) => ({
      allowedMethods: ['GET', 'OPTIONS'],
      allowedOrigins: configuration.get('administration.service.allowed-origins'),
    })
  }),
  useAccessTokenCookieReader({
    getConfiguration: async (configuration) => ({
      cookieName: configuration.get('cookie.access-token.name'),
      requiredPermissions: [
        'read:administration:dashboard-page',
      ]
    }),
    getSecrets: async (secrets) => ({
      jwtSecretKey: secrets.get('jwt.secret-key'),
    }),
  }),
  useLoginStateCookieWriter({
    getConfiguration: async (configuration) => ({
      cookieName: configuration.get('cookie.login-state.name'),
      cookieDomain: configuration.get('cookie.login-state.domain'),
    }),
    getSecrets: async (secrets) => ({
      encrypterSecretKey: secrets.get('encrypter.secret-key'),
    }),
  }),
  async (context) => {
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
        returnUrl: new URL(context.incomingMessage.url || '/', `https://${context.configuration.get('administration.service.host')}`),
      }))
      return void sendMovedTemporarilyRedirect(
        context,
        new URL('/login', `https://${context.configuration.get('administration.service.host')}`),
      );
    }
  },
  async (context) => {
    return void sendOKHTMLResponse(context, await <DashboardDocument />);
  }
])
