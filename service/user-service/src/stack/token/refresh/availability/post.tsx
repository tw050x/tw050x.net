import { UseAccessTokenCookieOptions, useAccessTokenCookie } from "@tw050x.net.library/authentication/middleware/use-access-token-cookie";
import { UseRefreshTokenCookieOptions, useRefreshTokenCookie } from "@tw050x.net.library/authentication/middleware/use-refresh-token-cookie";
import { read as readConfig } from "@tw050x.net.library/configs";
import { UseCorsHeadersFactoryOptions, useCorsHeaders } from "@tw050x.net.library/cors/use-cors-headers";
import { useLogRequest } from "@tw050x.net.library/middleware/use-log-request";
import { logger } from "@tw050x.net.library/logger";
import { read as readSecret } from "@tw050x.net.library/secrets";
import { defineServiceMiddleware } from "@tw050x.net.library/service";
import { default as UnrecoverableDocument } from "@tw050x.net.library/uikit/document/Unrecoverable";
import { default as jwt, SignOptions } from "jsonwebtoken";

const useCorsHeadersOptions: UseCorsHeadersFactoryOptions = {
  allowedMethods: ['GET', 'OPTIONS', 'POST'],
  allowedOrigins: readConfig('service.user.allowed-origins'),
}

const useAccessTokenCookieOptions: UseAccessTokenCookieOptions = {
  cookieName: readConfig('cookie.access-token.name'),
  cookieDomain: readConfig('cookie.access-token.domain'),
  jwtSecretKey: readSecret('jwt.secret-key'),
}

const useRefreshTokenCookieOptions: UseRefreshTokenCookieOptions = {
  jwtSecretKey: readSecret('jwt.secret-key'),
  refreshCookieName: readConfig("cookie.refresh-token.name"),
  refreshCookieDomain: readConfig("cookie.refresh-token.domain"),
  refreshableCookieName: readConfig("cookie.refreshable-token.name"),
  refreshableCookieDomain: readConfig("cookie.refreshable-token.domain"),
}

/**
 * The stack for the POST request to generate a nonce
 * This is used for authentication purposes
 */
export default defineServiceMiddleware([
  useLogRequest(),
  useCorsHeaders(useCorsHeadersOptions),
  useAccessTokenCookie(useAccessTokenCookieOptions),
  useRefreshTokenCookie(useRefreshTokenCookieOptions),
  async (context) => {
    console.log('Refresh token availability check received');
    return void context.serverResponse.sendNotImplementedTextResponse();
  }
])
