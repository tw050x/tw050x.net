import { UseAccessTokenCookieOptions, useAccessTokenCookie } from "@tw050x.net.library/authentication/middleware/use-access-token-cookie";
import { UseRefreshTokenCookieOptions, useRefreshTokenCookie } from "@tw050x.net.library/authentication/middleware/use-refresh-token-cookie";
import { UseCorsHeadersFactoryOptions, useCorsHeaders } from "@tw050x.net.library/cors/use-cors-headers";
import { useLogRequest } from "@tw050x.net.library/middleware/use-log-request";
import { logger } from "@tw050x.net.library/logger";
import { defineServiceMiddleware } from "@tw050x.net.library/service";
import { default as UnrecoverableDocument } from "@tw050x.net.library/uikit/document/Unrecoverable";
import { default as jwt, SignOptions } from "jsonwebtoken";
import { serviceParameters } from "../../../../parameters.js";
import { serviceSecrets } from "../../../../secrets.js";

const useCorsHeadersOptions: UseCorsHeadersFactoryOptions = {
  allowedMethods: ['GET', 'OPTIONS', 'POST'],
  allowedOrigins: serviceParameters.getParameter('user.service.allowed-origins'),
}

const useAccessTokenCookieOptions: UseAccessTokenCookieOptions = {
  cookieName: serviceParameters.getParameter('cookie.access-token.name'),
  cookieDomain: serviceParameters.getParameter('cookie.access-token.domain'),
  jwtSecretKey: serviceSecrets.getSecret('jwt.secret-key'),
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
  useRefreshTokenCookie(useRefreshTokenCookieOptions),
  async (context) => {
    console.log('Refresh token availability check received');
    return void context.serverResponse.sendNotImplementedTextResponse();
  }
])
