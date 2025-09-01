import { database } from '@tw050x.net/database';
import { logger } from "@tw050x.net/logger";
import { useAccessTokenCookieReader } from "@tw050x.net/middleware/use-access-token-cookie-reader";
import { useAccessTokenCookieWriter } from "@tw050x.net/middleware/use-access-token-cookie-writer";
import { useCors } from "@tw050x.net/middleware/use-cors";
import { useLoginStateCookieReader } from "@tw050x.net/middleware/use-login-state-cookie-reader";
import { useRefreshTokenCookieReader } from "@tw050x.net/middleware/use-refresh-token-cookie-reader";
import { useRefreshTokenCookieWriter } from "@tw050x.net/middleware/use-refresh-token-cookie-writer";
import { useRefreshableTokenCookieReader } from "@tw050x.net/middleware/use-refreshable-token-cookie-reader";
import { useRefreshableTokenCookieWriter } from "@tw050x.net/middleware/use-refreshable-token-cookie-writer";
import { defineServiceMiddleware } from "@tw050x.net/service";
import { sendFoundRedirect } from "@tw050x.net/service/helper/redirect/send-found-redirect";
import { sendForbiddenHTMLResponse } from "@tw050x.net/service/helper/response/send-forbidden-html-response";
import { sendInternalServerErrorHTMLResponse } from "@tw050x.net/service/helper/response/send-internal-server-error-html-response";
import { sendOKHTMLResponse } from "@tw050x.net/service/helper/response/send-ok-html-response";
import { default as ForbiddenDocument } from "@tw050x.net/uikit/document/Forbidden";
import { default as UnrecoverableDocument } from "@tw050x.net/uikit/document/Unrecoverable";
import { SignOptions, sign, verify } from "jsonwebtoken";
import { default as LoginDocument } from "../../template/document/LoginDocument";

export default defineServiceMiddleware([
  async (context) => {
    logger.debug(`GET ${context.incomingMessage.url}`);
  },
  useCors({
    getConfiguration: async (configuration) => ({
      allowedMethods: ['GET', 'POST', 'OPTIONS'],
      allowedOrigins: configuration.get('authentication.service.allowed-origins'),
    }),
  }),
  useAccessTokenCookieReader({
    getConfiguration: async (configuration) => ({
      cookieName: configuration.get('cookie.access-token.name'),
    }),
    getSecrets: async (secrets) => ({
      jwtSecretKey: secrets.get('jwt.secret-key'),
    }),
  }),
  useAccessTokenCookieWriter({
    getConfiguration: async (configuration) => ({
      cookieName: configuration.get('cookie.access-token.name'),
      cookieDomain: configuration.get('cookie.access-token.domain'),
    }),
  }),
  useLoginStateCookieReader({
    getConfiguration: async (configuration) => ({
      allowedReturnUrlDomains: configuration.get('authentication.service.allowed-return-url-domains'),
      cookieName: configuration.get('cookie.login-state.name'),
    }),
    getSecrets: async (secrets) => ({
      encrypterSecretKey: secrets.get('encrypter.secret-key'),
    }),
  }),
  useRefreshTokenCookieReader({
    getConfiguration: async (configuration) => ({
      cookieName: configuration.get('cookie.refresh-token.name'),
    }),
    getSecrets: async (configuration) => ({
      jwtSecretKey: configuration.get('jwt.secret-key'),
    }),
  }),
  useRefreshTokenCookieWriter({
    getConfiguration: async (configuration) => ({
      cookieName: configuration.get('cookie.refresh-token.name'),
      cookieDomain: configuration.get('cookie.refresh-token.domain'),
    }),
  }),
  useRefreshableTokenCookieReader({
    getConfiguration: async (configuration) => ({
      cookieName: configuration.get('cookie.refreshable-token.name'),
    }),
  }),
  useRefreshableTokenCookieWriter({
    getConfiguration: async (configuration) => ({
      cookieName: configuration.get('cookie.refreshable-token.name'),
      cookieDomain: configuration.get('cookie.refreshable-token.domain'),
    }),
  }),

  // check if the user has a valid access token
  // async (context) => {

  // },

  // check if the user has a valid refresh token
  async (context) => {
    const refreshableTokenCookie = context.incomingMessage.refreshableTokenCookie.raw;
    refreshAuthenticationGuard: {
      if (typeof refreshableTokenCookie !== 'string' || refreshableTokenCookie !== 'true') {
        logger.debug('user is not authenticated');
        break refreshAuthenticationGuard;
      }
      logger.debug('user is already authenticated');

      // if refresh token cookie is not set
      // then clear the refreshable token cookie and break out of the guard
      const refreshTokenCookie = context.incomingMessage.refreshTokenCookie.raw;
      if (typeof refreshTokenCookie !== 'string') {
        logger.debug('refresh token cookie is not set');
        context.serverResponse.refreshableTokenCookie.clear();
        break refreshAuthenticationGuard;
      }

      // verify the refresh token
      // if it fails then clear the refreshable token cookie and return a forbidden error
      let refreshTokenPayload;
      try {
        refreshTokenPayload = verify(refreshTokenCookie, context.configuration.get('jwt.secret-key'));
      }
      catch (error) {
        logger.error('unable to verify refresh token', { error });
        context.serverResponse.refreshableTokenCookie.clear();
        context.serverResponse.refreshTokenCookie.clear();
        return void sendForbiddenHTMLResponse(context, await <ForbiddenDocument />);
      }

      // fetch the user permissions
      // return an error if unable to fetch the user permissions
      let permissionsDocuments;
      try {
        permissionsDocuments = await database.authentication.permissions.find({
          user_uuid: refreshTokenPayload.sub,
          enabled: true
        }).toArray();
      }
      catch (error) {
        logger.error('unable to fetch user permissions', { error });
        return void sendInternalServerErrorHTMLResponse(context, await <UnrecoverableDocument />);
      }

      // create the access token cookie
      const accessTokenOptions: SignOptions = {
        expiresIn: '1d',
      };
      const accessTokenPayload = {
        rol: permissionsDocuments.map((document) => document.key),
        sub: refreshTokenPayload.sub
      };
      const accessToken = sign(accessTokenPayload, context.secrets.get('jwt.secret-key'), accessTokenOptions);
      const returnUrl = context.incomingMessage.loginStateCookie.payload?.returnUrl || new URL('/', `https://${context.configuration.get('authentication.service.host')}`);
      context.serverResponse.accessTokenCookie.set(accessToken);
      context.serverResponse.loginStateCookie.clear();
      return void sendFoundRedirect(context, returnUrl);
    }
  },

  // user is not authenticated and does not have a valid refresh token
  async (context) => {

    // return the login page
    return void sendOKHTMLResponse(context, await <LoginDocument />);
  }
])
