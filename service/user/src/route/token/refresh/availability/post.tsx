import { useAccessTokenCookie } from "@tw050x.net.library/user/middleware/use-access-token-cookie";
import { useRefreshTokenCookie } from "@tw050x.net.library/user/middleware/use-refresh-token-cookie";
import { UseCorsHeadersFactoryOptions, useCorsHeaders } from "@tw050x.net.library/cors/use-cors-headers";
import { useLogRequest } from "@tw050x.net.library/middleware/use-log-request";
import { logger } from "@tw050x.net.library/logger";
import { defineServiceMiddleware } from "@tw050x.net.library/service";
import { default as UnrecoverableDocument } from "@tw050x.net.library/uikit/document/Unrecoverable";
import { default as RefreshAuthenticationTokens } from "@tw050x.net.library/user/component/RefreshAuthenticationTokens";
import { default as jwt, SignOptions } from "jsonwebtoken";

const useCorsHeadersOptions: UseCorsHeadersFactoryOptions = {
  allowedMethods: ['GET', 'OPTIONS', 'POST'],
}

/**
 * The stack for the POST request to generate a nonce
 * This is used for authentication purposes
 */
export default defineServiceMiddleware([
  useLogRequest(),
  useCorsHeaders(useCorsHeadersOptions),
  useAccessTokenCookie(),
  useRefreshTokenCookie(),
  async (context) => {

    // Check the presence of a refresh token. If not token then remove any existing access token cookie.
    if (context.incomingMessage.refreshTokenCookie.raw === undefined) {
      context.serverResponse.accessTokenCookie.clear();
      context.serverResponse.refreshTokenCookie.clear();
      return void context.serverResponse.sendOKHTMLResponse(
        <RefreshAuthenticationTokens disabled={true} />,
      );
    }

    // Check the presence of an access token
    if (context.incomingMessage.accessTokenCookie.raw === undefined) {
      context.serverResponse.accessTokenCookie.clear();
      context.serverResponse.refreshTokenCookie.clear();
      return void context.serverResponse.sendOKHTMLResponse(
        <RefreshAuthenticationTokens disabled={true} />,
      );
    }

    return void context.serverResponse.sendOKHTMLResponse(
      <RefreshAuthenticationTokens />,
    );
  }
]);
