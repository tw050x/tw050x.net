import { UseAccessTokenCookieOptions, useAccessTokenCookie } from "@tw050x.net.library/user/middleware/use-access-token-cookie";
import { UseLoginStateCookieOptions, useLoginStateCookie } from "@tw050x.net.library/user/middleware/use-login-state-cookie";
import { UseRefreshTokenCookieOptions, useRefreshTokenCookie } from "@tw050x.net.library/user/middleware/use-refresh-token-cookie";
import { read as readConfig } from "@tw050x.net.library/configs";
import { UseCorsHeadersFactoryOptions, useCorsHeaders } from "@tw050x.net.library/cors/use-cors-headers";
import { logger } from "@tw050x.net.library/logger";
import { useLogRequest } from "@tw050x.net.library/middleware/use-log-request";
import { read as readSecret } from "@tw050x.net.library/secrets";
import { defineServiceMiddleware } from "@tw050x.net.library/service";
import { default as Unrecoverable } from "@tw050x.net.library/uikit/document/Unrecoverable";
import { generateLoginFormNonce } from '../../helper/generate-login-form-nonce.js';
import { useLoginEnabledGate } from "../../middleware/use-login-enabled-gate.js";
import { useRefreshTokenGate } from "../../middleware/use-refresh-token-gate.js";
import { default as LoginWithOAuth } from "../../template/document/LoginWithOAuth.js";

const useCorsHeadersOptions: UseCorsHeadersFactoryOptions = {
  allowedMethods: ['GET', 'POST', 'OPTIONS'],
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
    logger.debug('Creating nonce for login form');
    let nonce;
    try {
      nonce = await generateLoginFormNonce();
    }
    catch (error) {
      logger.error(error);
      return void context.serverResponse.sendInternalServerErrorHTMLResponse(<Unrecoverable />);
    }
    const loginAsideProps = {
      oauthProviders: {
        google: { enabled: true },
      }
    }

    // return the login page
    logger.debug('Rendering login page');
    const returnUrl = context.incomingMessage.loginStateCookie.payload?.returnUrl || new URL('/', `https://${readConfig('service.user.host')}`);
    context.serverResponse.loginStateCookie.set(JSON.stringify({
      returnUrl: returnUrl.toString()
    }));
    return void context.serverResponse.sendOKHTMLResponse(
      <LoginWithOAuth
        loginWithOAuthAsideProps={loginAsideProps}
      />
    );
  }
])
