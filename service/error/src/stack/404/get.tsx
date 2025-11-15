import { read as readConfig } from "@tw050x.net.library/configs";
import { useCorsHeaders, UseCorsHeadersFactoryOptions } from "@tw050x.net.library/cors/use-cors-headers";
import { useLogRequest } from "@tw050x.net.library/middleware/use-log-request";
import { defineServiceMiddleware } from "@tw050x.net.library/service";
import { default as NotFound } from "@tw050x.net.library/uikit/document/NotFound";

const useCorsHeadersOptions: UseCorsHeadersFactoryOptions = {
  allowedMethods: ['GET', 'OPTIONS'],
  allowedOrigins: readConfig('service.error.allowed-origins'),
}

export default defineServiceMiddleware([
  useLogRequest(),
  useCorsHeaders(useCorsHeadersOptions),

  // user is not authenticated and does not have a valid refresh token
  async (context) => {
    return void context.serverResponse.sendOKHTMLResponse(
      <NotFound />
    );
  }
])
