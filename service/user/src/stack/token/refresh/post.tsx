import { UseAccessTokenCookieOptions, useAccessTokenCookie } from "@tw050x.net.library/authentication/middleware/use-access-token-cookie";
import { UseLoginStateCookieOptions, useLoginStateCookie } from "@tw050x.net.library/authentication/middleware/use-login-state-cookie";
import { UseRefreshTokenCookieOptions, useRefreshTokenCookie } from "@tw050x.net.library/authentication/middleware/use-refresh-token-cookie";
import { UseCorsHeadersFactoryOptions, useCorsHeaders } from "@tw050x.net.library/cors/use-cors-headers";
import { useLogRequest } from "@tw050x.net.library/middleware/use-log-request";
import { logger } from "@tw050x.net.library/logger";
import { defineServiceMiddleware } from "@tw050x.net.library/service";
import { default as UnrecoverableDocument } from "@tw050x.net.library/uikit/document/Unrecoverable";
import { default as jwt, SignOptions } from "jsonwebtoken";
import { serviceParameters } from "../../../parameters.js";
import { serviceSecrets } from "../../../secrets.js";

const useCorsHeadersOptions: UseCorsHeadersFactoryOptions = {
  allowedMethods: ['OPTIONS', 'POST'],
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

/**
 * The stack for the POST request to generate a nonce
 * This is used for authentication purposes
 */
export default defineServiceMiddleware([
  useLogRequest(),
  useCorsHeaders(useCorsHeadersOptions),
  useAccessTokenCookie(useAccessTokenCookieOptions),
  useLoginStateCookie(useLoginStateCookieOptions),
  useRefreshTokenCookie(useRefreshTokenCookieOptions),
  async (context) => {

    // check for errors from token verification
    // if there are errors, log them and return a 400 Bad Request response
    if (context.incomingMessage.refreshTokenCookie.errors.length > 0) {
      context.incomingMessage.refreshTokenCookie.errors.forEach((error) => logger.error(error));
      return void context.serverResponse.sendBadRequestJSONResponse();
    }

    // If the bearer token is not authorised or payload is null,
    // return an error
    if (context.incomingMessage.refreshTokenCookie.payload === undefined) {
      logger.error('Bearer token payload is null');
      return void context.serverResponse.sendUnauthorizedJSONResponse();
    }
    if (context.incomingMessage.refreshTokenCookie.payload.sub === undefined) {
      logger.error('Bearer token payload sub is undefined');
      return void context.serverResponse.sendUnauthorizedJSONResponse();
    }

    const jwtSecretKey = serviceSecrets.getSecret('jwt.secret-key');
    if (jwtSecretKey === undefined) {
      logger.error('JWT secret key is undefined');
      return void context.serverResponse.sendInternalServerErrorHTMLResponse(<UnrecoverableDocument />);
    }

    // generate a new access token
    const accessTokenOptions: SignOptions = {
      expiresIn: '1d',
    };
    const accessTokenPayload = {
      sub: context.incomingMessage.refreshTokenCookie.payload.sub
    };
    const accessToken = jwt.sign(accessTokenPayload, jwtSecretKey, accessTokenOptions);
    context.serverResponse.accessTokenCookie.set(accessToken);
    return void context.serverResponse.sendSeeOtherRedirect(
      context.incomingMessage.loginStateCookie.payload?.returnUrl || new URL('/', `https://${serviceParameters.getParameter('user.service.host')}`),
    )
  }
])
