import { useAccessTokenCookie } from "@tw050x.net.library/user/middleware/use-access-token-cookie";
import { useLoginStateCookie } from "@tw050x.net.library/user/middleware/use-login-state-cookie";
import { useRefreshTokenCookie } from "@tw050x.net.library/user/middleware/use-refresh-token-cookie";
import { read as readConfig } from "@tw050x.net.library/configs";
import { UseCorsHeadersFactoryOptions, useCorsHeaders } from "@tw050x.net.library/cors/use-cors-headers";
import { logger } from "@tw050x.net.library/logger";
import { useLogRequest } from "@tw050x.net.library/middleware/use-log-request";
import { defineServiceMiddleware } from "@tw050x.net.library/service";
import { default as Unrecoverable } from "@tw050x.net.library/uikit/document/Unrecoverable";
import { generateLoginFormNonce } from '../../helper/generate-login-form-nonce.js';
import { useLoginEnabledGate } from "../../middleware/use-login-enabled-gate.js";
import { useRefreshTokenGate } from "../../middleware/use-refresh-token-gate.js";
import { default as LoginWithOAuth } from "../../template/document/LoginWithOAuth.js";

const useCorsHeadersOptions: UseCorsHeadersFactoryOptions = {
  allowedMethods: ['GET', 'POST', 'OPTIONS'],
}

export default defineServiceMiddleware([
  useLogRequest(),
  useCorsHeaders(useCorsHeadersOptions),
  useLoginEnabledGate(),
  useAccessTokenCookie(),
  useLoginStateCookie(),
  useRefreshTokenCookie(),

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
    const returnUrl = context.incomingMessage.loginStateCookie.payload?.returnUrl || new URL('/', `https://${readConfig('service.*.host')}`);
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
