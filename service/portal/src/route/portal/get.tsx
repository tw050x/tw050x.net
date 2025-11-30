import { read as readConfig } from "@tw050x.net.library/configs";
import { useCorsHeaders, UseCorsHeadersFactoryOptions } from "@tw050x.net.library/cors/use-cors-headers";
import { useLogRequest } from "@tw050x.net.library/middleware";
import { defineServiceMiddleware } from "@tw050x.net.library/service";
import { useLoginState } from "@tw050x.net.library/user/middleware/use-login-state";

const useCorsHeadersOptions: UseCorsHeadersFactoryOptions = {
  allowedMethods: ['GET', 'OPTIONS'],
}

export default defineServiceMiddleware([
  useLogRequest(),
  useCorsHeaders(useCorsHeadersOptions),
  useLoginState(),

  // Redirect to the dashboard
  async (context) => {
    return void context.serverResponse.sendMovedPermanentlyRedirect(
      new URL('/portal/dashboard', `https://${readConfig('service.*.host')}`)
    );
  }
])
