import { useAccessTokenCookie, UseAccessTokenCookieOptions } from "@tw050x.net.library/user/middleware/use-access-token-cookie";
import { UseLoginStateCookieOptions, useLoginStateCookie } from "@tw050x.net.library/user/middleware/use-login-state-cookie";
import { UseRefreshTokenCookieOptions, useRefreshTokenCookie } from "@tw050x.net.library/user/middleware/use-refresh-token-cookie";
import { read as readConfig } from "@tw050x.net.library/configs";
import { useCorsHeaders, UseCorsHeadersFactoryOptions } from "@tw050x.net.library/cors/use-cors-headers";
import { useLogRequest } from "@tw050x.net.library/middleware/use-log-request";
import { read as readSecret } from "@tw050x.net.library/secrets";
import { defineServiceMiddleware } from "@tw050x.net.library/service";

const useCorsHeadersOptions: UseCorsHeadersFactoryOptions = {
  allowedMethods: ['GET', 'OPTIONS', 'POST'],
  allowedOrigins: readConfig('service.user.allowed-origins'),
}

const useAccessTokenCookieOptions: UseAccessTokenCookieOptions = {
  cookieName: readConfig('cookie.access-token.name'),
  cookieDomain: readConfig('cookie.access-token.domain'),
  jwtSecretKey: readSecret('jwt.secret-key'),
}

const useLoginStateCookieOptions: UseLoginStateCookieOptions = {
  cookieName: readConfig('cookie.login-state.name'),
  cookieDomain: readConfig('cookie.login-state.domain'),
  encrypterSecretKey: readSecret('encrypter.secret-key'),
}

const useRefreshTokenCookieOptions: UseRefreshTokenCookieOptions = {
  jwtSecretKey: readSecret('jwt.secret-key'),
  refreshCookieName: readConfig("cookie.refresh-token.name"),
  refreshCookieDomain: readConfig("cookie.refresh-token.domain"),
  refreshableCookieName: readConfig("cookie.refreshable-token.name"),
  refreshableCookieDomain: readConfig("cookie.refreshable-token.domain"),
}

export default defineServiceMiddleware([
  useLogRequest(),
  useCorsHeaders(useCorsHeadersOptions),
  useAccessTokenCookie(useAccessTokenCookieOptions),
  useLoginStateCookie(useLoginStateCookieOptions),
  useRefreshTokenCookie(useRefreshTokenCookieOptions),

  // Handle the login form submission
  async (context) => {

    // clear cookies on the response
    context.serverResponse.refreshTokenCookie.clear();
    context.serverResponse.accessTokenCookie.clear();
    context.serverResponse.loginStateCookie.clear();

    // redirect to the home page;
    return void context.serverResponse.sendSeeOtherRedirect(
      new URL('/', `https://${readConfig('service.user.host')}`)
    )
  },
])
