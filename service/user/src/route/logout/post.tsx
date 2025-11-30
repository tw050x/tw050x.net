import { read as readConfig } from "@tw050x.net.library/configs";
import { useCorsHeaders, UseCorsHeadersFactoryOptions } from "@tw050x.net.library/cors/use-cors-headers";
import { useLogRequest } from "@tw050x.net.library/middleware/use-log-request";
import { defineServiceMiddleware } from "@tw050x.net.library/service";
import { useSession } from "@tw050x.net.library/sessions/middleware/use-session";
import { useLoginState } from "@tw050x.net.library/user/middleware/use-login-state";

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
