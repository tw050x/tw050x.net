import { UseAccessTokenCookieOptions, useAccessTokenCookie } from "@tw050x.net.library/authentication/middleware/use-access-token-cookie";
import { UseLoginStateCookieOptions, useLoginStateCookie } from "@tw050x.net.library/authentication/middleware/use-login-state-cookie";
import { UseRefreshTokenCookieOptions, useRefreshTokenCookie } from "@tw050x.net.library/authentication/middleware/use-refresh-token-cookie";
import { logger } from "@tw050x.net.library/logger";
import { UseCorsHeadersFactoryOptions, useCorsHeaders } from "@tw050x.net.library/cors/use-cors-headers";
import { useLogRequest } from "@tw050x.net.library/middleware/use-log-request";
import { defineServiceMiddleware } from "@tw050x.net.library/service";
import { default as Unrecoverable } from "@tw050x.net.library/uikit/document/Unrecoverable";
import { createCipheriv, randomBytes } from 'node:crypto';
import { default as googleAuthorisationURL } from '../../../helper/oauth2/provider/google/authorisation-url.js';
import { useLoginEnabledGate } from "../../../middleware/use-login-enabled-gate.js";
import { useRefreshTokenGate } from "../../../middleware/use-refresh-token-gate.js";
import { serviceParameters } from "../../../parameters.js";
import { serviceSecrets } from "../../../secrets.js";

const useCorsHeadersOptions: UseCorsHeadersFactoryOptions = {
  allowedMethods: ['GET', 'OPTIONS'],
  allowedOrigins: serviceParameters.getParameter('authentication.service.allowed-origins'),
}

const useAccessTokenCookieOptions: UseAccessTokenCookieOptions = {
  cookieName: serviceParameters.getParameter('cookie.access-token.name'),
  cookieDomain: serviceParameters.getParameter('cookie.access-token.domain'),
  jwtSecretKey: serviceSecrets.getSecret('jwt.secret-key'),
}

const useLoginStateCookieOptions: UseLoginStateCookieOptions = {
  cookieName: serviceParameters.getParameter('cookie.login-state.name'),
  cookieDomain: serviceParameters.getParameter('cookie.login-state.domain'),
  encrypterSecretKey: serviceSecrets.getSecret('encrypter.secret-key'),
}

const useRefreshTokenCookieOptions: UseRefreshTokenCookieOptions = {
  cookieDomain: serviceParameters.getParameter('cookie.refresh-token.domain'),
  jwtSecretKey: serviceSecrets.getSecret('jwt.secret-key'),
  refreshCookieName: serviceParameters.getParameter('cookie.refresh-token.name'),
  refreshableCookieName: serviceParameters.getParameter('cookie.refreshable-token.name'),
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

    const encrypterSecretKey = serviceSecrets.getSecret('encrypter.secret-key');

    const state = JSON.stringify({
      loginStatePayload: context.incomingMessage.loginStateCookie.payload,
      salt: randomBytes(16).toString('hex'),
    })

    let encryptedState;

    try {
      const iv = randomBytes(16);
      const cipher = createCipheriv('aes-256-cbc', Buffer.from(encrypterSecretKey, 'hex'), iv);
      encryptedState = cipher.update(state, 'utf8', 'hex');
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
          clientId: serviceParameters.getParameter('oauth2.provider.google.client-id'),
          redirectUrl: new URL('/oauth2/google/callback', `https://${serviceParameters.getParameter('authentication.service.host')}`),
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
