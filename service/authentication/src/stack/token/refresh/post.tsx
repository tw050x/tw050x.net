import { useAccessTokenCookieWriter } from "@tw050x.net.library/middleware/use-access-token-cookie-writer";
import { useCors } from "@tw050x.net.library/middleware/use-cors";
import { useLoginStateCookieReader } from "@tw050x.net.library/middleware/use-login-state-cookie-reader";
import { useRefreshTokenCookieReader } from "@tw050x.net.library/middleware/use-refresh-token-cookie-reader";
import { logger } from "@tw050x.net.library/logger";
import { defineServiceMiddleware } from "@tw050x.net.library/service";
import { sendSeeOtherRedirect } from "@tw050x.net.library/service/helper/redirect/send-see-other-redirect";
import { sendUnauthorizedJSONResponse } from "@tw050x.net.library/service/helper/response/send-unauthorized-json-response";
import { sendBadRequestJSONResponse } from "@tw050x.net.library/service/helper/response/send-bad-request-json-response";
import { SignOptions, sign } from "jsonwebtoken";

/**
 * The stack for the POST request to generate a nonce
 * This is used for authentication purposes
 */
export default defineServiceMiddleware([
  async (context) => {
    logger.debug(`POST ${context.incomingMessage.url}`);
  },
  useCors({
    getConfiguration: async () => ({
      allowedMethods: ['POST', 'OPTIONS'],
      allowedOrigins: '*',
    }),
  }),
  useAccessTokenCookieWriter({
    getConfiguration: async ({ configuration }) => ({
      cookieName: configuration.get('cookie.access-token.name'),
      cookieDomain: configuration.get('cookie.access-token.domain'),
    }),
  }),
  useLoginStateCookieReader({
    getConfiguration: async ({ configuration }) => ({
      allowedReturnUrlDomains: configuration.get('authentication.service.allowed-return-url-domains'),
      cookieName: configuration.get('cookie.login-state.name'),
    }),
    getSecrets: async ({ secrets }) => ({
      encrypterSecretKey: secrets.get('encrypter.secret-key'),
    }),
  }),
  useRefreshTokenCookieReader({
    getConfiguration: async ({ configuration }) => ({
      cookieName: configuration.get('cookie.refresh-token.name'),
    }),
    getSecrets: async ({ secrets }) => ({
      jwtSecretKey: secrets.get('jwt.secret-key'),
    }),
  }),
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

    // generate a new access token
    const jwtSecretKey = await context.secrets.get('jwt.secret-key');
    const accessTokenOptions: SignOptions = {
      expiresIn: '1d',
    };
    const accessTokenPayload = {
      sub: context.incomingMessage.refreshTokenCookie.payload.sub
    };
    const accessToken = sign(accessTokenPayload, jwtSecretKey, accessTokenOptions);
    context.serverResponse.accessTokenCookie.set(accessToken);
    const returnUrl = context.incomingMessage.loginStateCookie.payload?.returnUrl || new URL('/', `https://${context.configuration.get('authentication.service.host')}`);
    return void sendSeeOtherRedirect(
      context,
      returnUrl,
    )
  }
])
