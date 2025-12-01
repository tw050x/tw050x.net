import { useLoginState } from "@tw050x.net.library/platform/middleware/use-login-state";
import { read as readConfig } from "@tw050x.net.library/platform/helper/configs";
import { useCorsHeaders, UseCorsHeadersFactoryOptions } from "@tw050x.net.library/platform/middleware/use-cors-headers";
import { useLogRequest } from "@tw050x.net.library/platform/middleware/use-log-request";
import { default as defineServiceMiddleware } from "@tw050x.net.library/platform/middleware";
import { useSession } from "@tw050x.net.library/platform/middleware/use-session";

const useCorsHeadersOptions: UseCorsHeadersFactoryOptions = {
  allowedMethods: ['GET', 'OPTIONS', 'POST'],
}

export default defineServiceMiddleware([
  useLogRequest(),
  useCorsHeaders(useCorsHeadersOptions),
  useLoginState(),
  useSession({
    activity: 'post-user-logout-route',
  }),

  // Handle the login form submission
  async (context) => {

    // clear cookies on the response
    context.serverResponse.session.cookie.clear();
    context.serverResponse.loginState.cookie.clear();

    // redirect to the home page;
    return void context.serverResponse.sendSeeOtherRedirect(
      new URL('/', `https://${readConfig('service.*.host')}`)
    )
  },
])
