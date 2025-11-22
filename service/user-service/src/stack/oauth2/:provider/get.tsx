import { UseAccessTokenCookieOptions, useAccessTokenCookie } from "@tw050x.net.library/user/middleware/use-access-token-cookie";
import { UseLoginStateCookieOptions, useLoginStateCookie } from "@tw050x.net.library/user/middleware/use-login-state-cookie";
import { UseRefreshTokenCookieOptions, useRefreshTokenCookie } from "@tw050x.net.library/user/middleware/use-refresh-token-cookie";
import { read as readConfig } from "@tw050x.net.library/configs";
import { UseCorsHeadersFactoryOptions, useCorsHeaders } from "@tw050x.net.library/cors/use-cors-headers";
import { encrypt } from "@tw050x.net.library/encryption";
import { logger } from "@tw050x.net.library/logger";
import { useLogRequest } from "@tw050x.net.library/middleware/use-log-request";
import { read as readSecret } from "@tw050x.net.library/secrets";
import { defineServiceMiddleware } from "@tw050x.net.library/service";
import { default as Unrecoverable } from "@tw050x.net.library/uikit/document/Unrecoverable";
import { randomBytes } from 'node:crypto';
import { default as googleAuthorisationURL } from '../../../helper/oauth2/provider/google/authorisation-url.js';
import { useLoginEnabledGate } from "../../../middleware/use-login-enabled-gate.js";
import { useRefreshTokenGate } from "../../../middleware/use-refresh-token-gate.js";

const useCorsHeadersOptions: UseCorsHeadersFactoryOptions = {
  allowedMethods: ['GET', 'OPTIONS'],
  allowedOrigins: readConfig('service.user.allowed-origins'),
}

const useAccessTokenCookieOptions: UseAccessTokenCookieOptions = {
  cookieName: readConfig('cookie.access-token.name'),
  cookieDomain: readConfig('cookie.access-token.domain'),
  jwtSecretKey: readSecret('jwt.secret-key'),
}

const useLoginStateCookieOptions: UseLoginStateCookieOptions = {
  cookieName: readConfig('cookie.login-state.name'),
  cookieDomain: readConfig('cookie.login-state.domain'),
  encrypterSecretKey: readSecret('encrypter.secret-key'),
}

const useRefreshTokenCookieOptions: UseRefreshTokenCookieOptions = {
  jwtSecretKey: readSecret('jwt.secret-key'),
  refreshCookieName: readConfig('cookie.refresh-token.name'),
  refreshCookieDomain: readConfig('cookie.refresh-token.domain'),
  refreshableCookieName: readConfig('cookie.refreshable-token.name'),
  refreshableCookieDomain: readConfig('cookie.refreshable-token.domain'),
}

export default defineServiceMiddleware([
  useLogRequest(),
  useCorsHeaders(useCorsHeadersOptions),
  useLoginEnabledGate(),
  useAccessTokenCookie(useAccessTokenCookieOptions),
  useLoginStateCookie(useLoginStateCookieOptions),
  useRefreshTokenCookie(useRefreshTokenCookieOptions),

  // check if the user has a valid access token
  // async (context) => {
  // TODO: implement access token check
  // },

  useRefreshTokenGate(),

  // user is not authenticated and does not have a valid refresh token
  async (context) => {
    const { provider } = await context.incomingMessage.useUrlParams('/oauth2/:provider');

    const state = JSON.stringify({
      attempt: 1,
      returnUrl: context.incomingMessage.loginStateCookie.payload?.returnUrl ?? new URL('/', `https://${readConfig('service.user.host')}`),
      salt: randomBytes(16).toString('hex'),
    })

    let encryptedState;
    try {
      encryptedState = encrypt(state, readSecret('encrypter.secret-key'))
    }
    catch (error) {
      logger.error(error);
      logger.debug('Failed to encrypt state parameter for OAuth2 authorisation URL');
      return void context.serverResponse.sendInternalServerErrorHTMLResponse(
        <Unrecoverable />
      );
    }

    let authorisationURL: URL;
    switch (provider) {
      case 'google':
        authorisationURL = googleAuthorisationURL({
          clientId: readConfig('oauth2.google.client-id'),
          redirectUrl: new URL('/oauth2/google/callback', `https://${readConfig('service.user.host')}`),
          state: encryptedState,
        })
        break;
      default:
        logger.debug(`Unsupported OAuth2 provider requested: ${provider}`);
        logger.error(new Error(`Unsupported OAuth2 provider`));
        return void context.serverResponse.sendInternalServerErrorHTMLResponse(
          <Unrecoverable />
        )
    }

    return void context.serverResponse.sendSeeOtherRedirect(authorisationURL);
  }
])
