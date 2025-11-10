import { database as userDatabase } from "@tw050x.net.database/user";
import { UseAccessTokenCookieOptions, useAccessTokenCookie } from "@tw050x.net.library/authentication/middleware/use-access-token-cookie";
import { UseLoginStateCookieOptions, useLoginStateCookie } from "@tw050x.net.library/authentication/middleware/use-login-state-cookie";
import { UseRefreshTokenCookieOptions, useRefreshTokenCookie } from "@tw050x.net.library/authentication/middleware/use-refresh-token-cookie";
import { logger } from "@tw050x.net.library/logger";
import { UseCorsHeadersFactoryOptions, useCorsHeaders } from "@tw050x.net.library/cors/use-cors-headers";
import { decrypt, encrypt } from "@tw050x.net.library/encryption";
import { useLogRequest } from "@tw050x.net.library/middleware/use-log-request";
import { defineServiceMiddleware } from "@tw050x.net.library/service";
import { default as Unrecoverable } from "@tw050x.net.library/uikit/document/Unrecoverable";
import { default as googleAuthorisationURL } from '../../../../helper/oauth2/provider/google/authorisation-url.js';
import { default as googleOAuth2ExchangeCodeForAccessToken } from '../../../../helper/oauth2/provider/google/exchange-code-for-access-token.js';
import { useLoginEnabledGate } from "../../../../middleware/use-login-enabled-gate.js";
import { useRefreshTokenGate } from "../../../../middleware/use-refresh-token-gate.js";
import { default as OAuthCallback } from "../../../../template/document/OAuthCallback.js";
import { serviceParameters } from "../../../../parameters.js";
import { serviceSecrets } from "../../../../secrets.js";

const useCorsHeadersOptions: UseCorsHeadersFactoryOptions = {
  allowedMethods: ['GET', 'POST', 'OPTIONS'],
  allowedOrigins: serviceParameters.getParameter('user.service.allowed-origins'),
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
    const { provider } = await context.incomingMessage.useUrlParams('/oauth2/:provider/callback');
    const { code, error, state } = await context.incomingMessage.useUrlQuery();

    if (state === undefined) {
      logger.debug('Missing OAuth2 state in callback');
      return context.serverResponse.sendBadRequestHTMLResponse(
        <Unrecoverable />
      )
    }

    let decryptedState;
    try {
      decryptedState = decrypt(state, serviceSecrets.getSecret('encrypter.secret-key'));
    }
    catch (error) {
      logger.error(error);
      logger.debug('Failed to decrypt OAuth2 state in callback');
      return context.serverResponse.sendBadRequestHTMLResponse(
        <Unrecoverable />
      )
    }

    successfullyAuthenticationGuard: {
      if (error !== undefined) {
        break successfullyAuthenticationGuard;
      }

      if (code === undefined) {
        logger.debug('Missing OAuth2 code in callback');
        return context.serverResponse.sendBadRequestHTMLResponse(
          <OAuthCallback error="missing_oauth2_code" provider={provider} />
        )
      }

      // TODO: handle successful authentication flow
      let oauthAccessToken;
      switch (provider) {
        case 'google':
          oauthAccessToken = await googleOAuth2ExchangeCodeForAccessToken(code);
          break;
        default:
          logger.debug('OAuth2 callback received for unsupported provider', { provider });
          return context.serverResponse.sendBadRequestHTMLResponse(
            <Unrecoverable />
          )
      }

      // retrieve user info from provider

      // lookup user via api call to user service
      //   if user doesn't exist:
      //     make api call to create the user via the user service and return the user profile id
      //   else:
      //     retrieve user profile id

      // create access and refresh tokens, set cookies, redirect to returnUrl

      return context.serverResponse.sendSeeOtherRedirect(
        new URL('/', `https://${serviceParameters.getParameter('user.service.host')}`)
      )
    }

    // Abandon the flow if required fields are missing
    if (('attempt' in decryptedState) === false) {
      logger.debug('Missing attempt count in decrypted OAuth2 state in callback');
      return context.serverResponse.sendBadRequestHTMLResponse(
        <Unrecoverable />
      )
    }

    // Validate attempt count type
    if (typeof decryptedState.attempt !== 'number') {
      logger.debug('Invalid attempt count in decrypted OAuth2 state in callback');
      return context.serverResponse.sendBadRequestHTMLResponse(
        <Unrecoverable />
      )
    }
    let attempt: number = decryptedState.attempt;

    // Handle retryable errors
    if (attempt >= 3) {
      logger.debug(`OAuth2 authentication attempt ${attempt} failed for provider ${provider}, exceeding retry limit`);
      return context.serverResponse.sendBadRequestHTMLResponse(
        <OAuthCallback error="retry_limit_exceeded" provider={provider} />
      );
    }

    // Increment attempt count
    attempt += 1;

    // Re-encrypt state with updated attempt count
    const updatedEncryptedState = encrypt(
      JSON.stringify({
        ...decryptedState,
        attempt,
      }),
      serviceSecrets.getSecret('encrypter.secret-key')
    );

    switch (`${provider}__${error}`) {
      case 'google__interaction_required':
        const authorisationURL = googleAuthorisationURL({
          clientId: serviceParameters.getParameter('oauth2.provider.google.client-id'),
          prompt: 'consent login',
          redirectUrl: new URL('/oauth2/google/callback', `https://${serviceParameters.getParameter('user.service.host')}`),
          state: updatedEncryptedState,
        })
        return void context.serverResponse.sendSeeOtherRedirect(authorisationURL);
      default:
        logger.debug('OAuth2 callback returned error that is not handled:', { provider, error });
        return context.serverResponse.sendBadRequestHTMLResponse(
          <OAuthCallback error={error} provider={provider} />
        )
    }
  }
])
