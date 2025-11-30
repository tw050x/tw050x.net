import { read as readConfig } from "@tw050x.net.library/configs";
import { UseCorsHeadersFactoryOptions, useCorsHeaders } from "@tw050x.net.library/cors/use-cors-headers";
import { logger } from "@tw050x.net.library/logger";
import { useLogRequest } from "@tw050x.net.library/middleware/use-log-request";
import { defineServiceMiddleware } from "@tw050x.net.library/service";
import { useLoginEnabled } from "@tw050x.net.library/user/middleware/use-login-enabled";
import { useLoginEnabledGate } from "@tw050x.net.library/user/middleware/use-login-enabled-gate";
import { useLoginState } from "@tw050x.net.library/user/middleware/use-login-state";
import { default as LoginWithOAuth } from "@tw050x.net.library/user/template/document/LoginWithOAuth";

const useCorsHeadersOptions: UseCorsHeadersFactoryOptions = {
  allowedMethods: ['GET', 'POST', 'OPTIONS'],
}

export default defineServiceMiddleware([
  useLogRequest(),
  useCorsHeaders(useCorsHeadersOptions),
  useLoginEnabled(),
  useLoginEnabledGate(),
  useLoginState(),

  // user is not authenticated and does not have a valid refresh token
  async (context) => {
    logger.debug('Creating nonce for login form');

    // create login aside props
    const loginAsideProps = {
      oauthProviders: {
        google: { enabled: true },
      }
    }

    // return the login page
    logger.debug('Rendering login page');
    const returnUrl = context.incomingMessage.loginState.cookie.payload?.returnUrl || new URL('/', `https://${readConfig('service.*.host')}`);
    context.serverResponse.loginState.cookie.set(
      JSON.stringify({
        returnUrl: returnUrl.toString()
      })
    );
    return void context.serverResponse.sendOKHTMLResponse(
      <LoginWithOAuth
        loginWithOAuthAsideProps={loginAsideProps}
      />
    );
  }
])
