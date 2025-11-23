import { useCorsHeaders, UseCorsHeadersFactoryOptions } from "@tw050x.net.library/cors/use-cors-headers";
import { useLogRequest } from "@tw050x.net.library/middleware/use-log-request";
import { defineServiceMiddleware } from "@tw050x.net.library/service";
import { useAccessTokenCookie } from "@tw050x.net.library/user/middleware/use-access-token-cookie";
import { useRefreshTokenCookie } from "@tw050x.net.library/user/middleware/use-refresh-token-cookie";
import { default as Home } from "../template/document/Home.js";

const useCorsHeadersOptions: UseCorsHeadersFactoryOptions = {
  allowedMethods: ['GET', 'OPTIONS'],
}

export default defineServiceMiddleware([
  useLogRequest(),
  useCorsHeaders(useCorsHeadersOptions),
  useAccessTokenCookie(),
  useRefreshTokenCookie(),
  async (context) => {
    const homeProps = {
      refreshAuthenticationTokenProps: {
        disabled: false,
      }
    }

    if (context.incomingMessage.accessTokenCookie.raw === undefined) {
      homeProps.refreshAuthenticationTokenProps.disabled = true;
    }

    if (context.incomingMessage.refreshTokenCookie.refreshable === false) {
      homeProps.refreshAuthenticationTokenProps.disabled = true;
    }

    return void context.serverResponse.sendOKHTMLResponse(
      <Home {...homeProps} />
    );
  }
])
