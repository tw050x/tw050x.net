import { UseAccessTokenCookieOptions, useAccessTokenCookie } from "@tw050x.net.library/authentication/middleware/use-access-token-cookie";
import { UseLoginStateCookieOptions, useLoginStateCookie } from "@tw050x.net.library/authentication/middleware/use-login-state-cookie";
import { UseRefreshTokenCookieOptions, useRefreshTokenCookie } from "@tw050x.net.library/authentication/middleware/use-refresh-token-cookie";
import { logger } from "@tw050x.net.library/logger";
import { UseCorsHeadersFactoryOptions, useCorsHeaders } from "@tw050x.net.library/cors/use-cors-headers";
import { useLogRequest } from "@tw050x.net.library/middleware/use-log-request";
import { defineServiceMiddleware } from "@tw050x.net.library/service";
import { default as UnrecoverableDocument } from "@tw050x.net.library/uikit/document/Unrecoverable";
import { default as googleAuthorisationURL } from '../../../../helper/oauth2/provider/google/authorisation-url.js';
import { useLoginEnabledGate } from "../../../../middleware/use-login-enabled-gate.js";
import { useRefreshTokenGate } from "../../../../middleware/use-refresh-token-gate.js";
import { default as LoginDocument } from "../../../../template/document/LoginWithPassword.js";
import { serviceParameters } from "../../../../parameters.js";
import { serviceSecrets } from "../../../../secrets.js";

const useCorsHeadersOptions: UseCorsHeadersFactoryOptions = {
  allowedMethods: ['GET', 'POST', 'OPTIONS'],
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
    const { error, state } = await context.incomingMessage.useUrlQuery();

    errorInCallbackGuard: {
      if (error === undefined) {
        break errorInCallbackGuard;
      }

      switch (error) {
        case 'interaction_required':
          const authorisationURL = googleAuthorisationURL({
            clientId: serviceParameters.getParameter('oauth2.provider.google.client-id'),
            prompt: 'consent login',
            redirectUrl: new URL('/oauth2/google/callback', `https://${serviceParameters.getParameter('authentication.service.host')}`),
            state,
          })
          return void context.serverResponse.sendSeeOtherRedirect(authorisationURL);
          break;
      }


      return context.serverResponse.sendSeeOtherRedirect(
        new URL('/login', `https://${serviceParameters.getParameter('authentication.service.host')}`),
      )
    }

    return context.serverResponse.sendSeeOtherRedirect(
      new URL('/', `https://${serviceParameters.getParameter('authentication.service.host')}`)
    )
  }
])
