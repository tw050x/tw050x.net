import { readParameter, useParameter } from "@tw050x.net.library/configuration";
import { UseAccessTokenCookieOptions, useAccessTokenCookie } from "@tw050x.net.library/middleware/use-access-token-cookie";
import { UseCorsHeadersFactoryOptions, useCorsHeaders } from "@tw050x.net.library/middleware/use-cors-headers";
import { useLogRequest } from "@tw050x.net.library/middleware/use-log-request";
import { UseLoginStateCookieOptions, useLoginStateCookie } from "@tw050x.net.library/middleware/use-login-state-cookie";
import { UseRefreshTokenCookieOptions, useRefreshTokenCookie } from "@tw050x.net.library/middleware/use-refresh-token-cookie";
import { logger } from "@tw050x.net.library/logger";
import { readSecret, useSecret } from "@tw050x.net.library/secret";
import { defineServiceMiddleware } from "@tw050x.net.library/service";
import { sendSeeOtherRedirect } from "@tw050x.net.library/service/helper/redirect/send-see-other-redirect";
import { sendBadRequestJSONResponse } from "@tw050x.net.library/service/helper/response/send-bad-request-json-response";
import { sendUnauthorizedJSONResponse } from "@tw050x.net.library/service/helper/response/send-unauthorized-json-response";
import { sendInternalServerErrorHTMLResponse } from "@tw050x.net.library/service/helper/response/send-internal-server-error-html-response";
import { default as UnrecoverableDocument } from "@tw050x.net.library/uikit/document/Unrecoverable";
import { SignOptions, sign } from "jsonwebtoken";

const useCorsHeadersOptions: UseCorsHeadersFactoryOptions = {
  allowedMethods: ['GET', 'OPTIONS', 'POST'],
  allowedOrigins: useParameter('authentication.service.allowed-origins'),
}

const useAccessTokenCookieOptions: UseAccessTokenCookieOptions = {
  cookieName: useParameter('cookie.access-token.name'),
  cookieDomain: useParameter('cookie.access-token.domain'),
  jwtSecretKey: useSecret('jwt.secret-key'),
}

const useLoginStateCookieOptions: UseLoginStateCookieOptions = {
  allowedReturnUrlDomains: useParameter('authentication.service.allowed-return-url-domains'),
  cookieName: useParameter('cookie.login-state.name'),
  cookieDomain: useParameter('cookie.login-state.domain'),
  encrypterSecretKey: useSecret('encrypter.secret-key'),
}

const useRefreshTokenCookieOptions: UseRefreshTokenCookieOptions = {
  cookieName: useParameter('cookie.refresh-token.name'),
  cookieDomain: useParameter('cookie.refresh-token.domain'),
  jwtSecretKey: useSecret('jwt.secret-key'),
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
      return void sendBadRequestJSONResponse(context);
    }

    // If the bearer token is not authorised or payload is null,
    // return an error
    if (context.incomingMessage.refreshTokenCookie.payload === undefined) {
      logger.error('Bearer token payload is null');
      return void sendUnauthorizedJSONResponse(context);
    }
    if (context.incomingMessage.refreshTokenCookie.payload.sub === undefined) {
      logger.error('Bearer token payload sub is undefined');
      return void sendUnauthorizedJSONResponse(context);
    }

    const jwtSecretKey = await readSecret('jwt.secret-key');
    if (jwtSecretKey === undefined) {
      logger.error('JWT secret key is undefined');
      return void sendInternalServerErrorHTMLResponse(context, await <UnrecoverableDocument />);
    }

    // generate a new access token
    const accessTokenOptions: SignOptions = {
      expiresIn: '1d',
    };
    const accessTokenPayload = {
      sub: context.incomingMessage.refreshTokenCookie.payload.sub
    };
    const accessToken = sign(accessTokenPayload, jwtSecretKey, accessTokenOptions);
    context.serverResponse.accessTokenCookie.set(accessToken);
    const returnUrl = context.incomingMessage.loginStateCookie.payload?.returnUrl || new URL('/', `https://${await readParameter('authentication.service.host')}`);
    return void sendSeeOtherRedirect(
      context,
      returnUrl,
    )
  }
])
