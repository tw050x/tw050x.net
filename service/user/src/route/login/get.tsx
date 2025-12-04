import { useLoginEnabled } from "@tw050x.net.library/platform/middleware/use-login-enabled";
import { useLoginEnabledGate } from "@tw050x.net.library/platform/middleware/use-login-enabled-gate";
import { useLoginState } from "@tw050x.net.library/platform/middleware/use-login-state";
import { default as LoginWithOAuth } from "@tw050x.net.library/platform/template/document/LoginWithOAuth";
import { read as readConfig } from "@tw050x.net.library/platform/helper/configs";
import { useCorsHeaders } from "@tw050x.net.library/platform/middleware/use-cors-headers";
import { logger } from "@tw050x.net.library/platform/helper/logger";
import { useLogRequest } from "@tw050x.net.library/platform/middleware/use-log-request";
import { default as defineServiceMiddleware } from "@tw050x.net.library/platform/middleware";

export default defineServiceMiddleware([
  useLogRequest(),
  useCorsHeaders({
    allowedMethods: ['GET', 'POST', 'OPTIONS'],
  }),
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
    let returnUrl = context.incomingMessage.loginState.cookie.payload?.returnUrl
    if (returnUrl === undefined) {
      returnUrl = new URL('/', `https://${readConfig('service.*.host')}`);
    }
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
