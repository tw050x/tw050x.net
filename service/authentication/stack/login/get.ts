import { database } from '@tw050x.net/database';
import { default as logger } from "@tw050x.net/logger";
import { useAccessTokenCookieWriter } from "@tw050x.net/middleware/use-access-token-cookie-writer";
import { useCors } from "@tw050x.net/middleware/use-cors";
import { useLoginStateCookieReader } from "@tw050x.net/middleware/use-login-state-cookie-reader";
import { useRefreshTokenCookieReader } from "@tw050x.net/middleware/use-refresh-token-cookie-reader";
import { useRefreshTokenCookieWriter } from "@tw050x.net/middleware/use-refresh-token-cookie-writer";
import { useRefreshableTokenCookieReader } from "@tw050x.net/middleware/use-refreshable-token-cookie-reader";
import { useRefreshableTokenCookieWriter } from "@tw050x.net/middleware/use-refreshable-token-cookie-writer";
import { defineServiceMiddleware } from "@tw050x.net/service";
import { sendForbiddenHTMLResponse, sendFoundRedirect, sendInternalServerErrorHTMLResponse, sendOKHTMLResponse } from "@tw050x.net/service/helper";
import { forbiddenDocument, unrecoverableDocument } from "@tw050x.net/uikit/document";
import { SignOptions, sign, verify } from "jsonwebtoken";
import { loginDocument } from "../../template";

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
  async (context) => {

    // check if the user is already authenticated
    // redirect to the token refresh page if they are
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
        return void sendForbiddenHTMLResponse(context.serverResponse, forbiddenDocument());
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
        return void sendInternalServerErrorHTMLResponse(context.serverResponse, unrecoverableDocument());
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
      context.serverResponse.accessTokenCookie.set(accessToken);
      const returnUrl = context.incomingMessage.loginStateCookie.payload?.returnUrl || new URL('/', `https://${context.configuration.get('authentication.service.host')}`);
      return void sendFoundRedirect(context.serverResponse, returnUrl);
    }

    // return the login page
    return void sendOKHTMLResponse(context.serverResponse, loginDocument());
  }
])
