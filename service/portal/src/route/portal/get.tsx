import { useLoginState } from "@tw050x.net.library/platform/middleware/use-login-state";
import { read as readConfig } from "@tw050x.net.library/platform/helper/configs";
import { useCorsHeaders, UseCorsHeadersFactoryOptions } from "@tw050x.net.library/platform/middleware/use-cors-headers";
import { useLogRequest } from "@tw050x.net.library/platform/middleware/use-log-request";
import { default as defineServiceMiddleware } from "@tw050x.net.library/platform/middleware";
import { useSession } from "@tw050x.net.library/platform/middleware/use-session";
import { useSessionGate } from "@tw050x.net.library/platform/middleware/use-session-gate";

const useCorsHeadersOptions: UseCorsHeadersFactoryOptions = {
  allowedMethods: ['GET', 'OPTIONS'],
}

export default defineServiceMiddleware([
  useLogRequest(),
  useCorsHeaders(useCorsHeadersOptions),
  useLoginState(),
  useSession({
    activity: 'get-portal-route',
  }),
  useSessionGate(),

  // Redirect to the dashboard
  async (context) => {
    return void context.serverResponse.sendMovedPermanentlyRedirect(
      new URL('/portal/dashboard', `https://${readConfig('service.*.host')}`)
    );
  }
])
