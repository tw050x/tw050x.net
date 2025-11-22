import { useAccessTokenCookie } from "@tw050x.net.library/user/middleware/use-access-token-cookie";
import { useLoginStateCookie } from "@tw050x.net.library/user/middleware/use-login-state-cookie";
import { useRefreshTokenCookie } from "@tw050x.net.library/user/middleware/use-refresh-token-cookie";
import { read as readConfig } from "@tw050x.net.library/configs";
import { useCorsHeaders, UseCorsHeadersFactoryOptions } from "@tw050x.net.library/cors/use-cors-headers";
import { useLogRequest } from "@tw050x.net.library/middleware/use-log-request";
import { read as readSecret } from "@tw050x.net.library/secrets";
import { defineServiceMiddleware } from "@tw050x.net.library/service";

const useCorsHeadersOptions: UseCorsHeadersFactoryOptions = {
  allowedMethods: ['GET', 'OPTIONS', 'POST'],
}

export default defineServiceMiddleware([
  useLogRequest(),
  useCorsHeaders(useCorsHeadersOptions),
  useAccessTokenCookie(),
  useLoginStateCookie(),
  useRefreshTokenCookie(),

  // Handle the login form submission
  async (context) => {

    // clear cookies on the response
    context.serverResponse.refreshTokenCookie.clear();
    context.serverResponse.accessTokenCookie.clear();
    context.serverResponse.loginStateCookie.clear();

    // redirect to the home page;
    return void context.serverResponse.sendSeeOtherRedirect(
      new URL('/', `https://${readConfig('service.*.host')}`)
    )
  },
])
