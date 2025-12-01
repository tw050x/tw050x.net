import { useCorsHeaders, UseCorsHeadersFactoryOptions } from "@tw050x.net.library/platform/middleware/use-cors-headers";
import { useLogRequest } from "@tw050x.net.library/platform/middleware/use-log-request";
import { default as defineServiceMiddleware } from "@tw050x.net.library/platform/middleware";
import { default as NotFound } from "@tw050x.net.library/platform/template/document/NotFound";

const useCorsHeadersOptions: UseCorsHeadersFactoryOptions = {
  allowedMethods: ['GET', 'OPTIONS'],
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
