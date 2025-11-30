import { useCorsHeaders, UseCorsHeadersFactoryOptions } from "@tw050x.net.library/cors/use-cors-headers";
import { useLogRequest } from "@tw050x.net.library/middleware/use-log-request";
import { defineServiceMiddleware } from "@tw050x.net.library/service";
import { useSession } from "@tw050x.net.library/sessions/middleware/use-session";
import { default as Home } from "../template/document/Home.js";

const useCorsHeadersOptions: UseCorsHeadersFactoryOptions = {
  allowedMethods: ['GET', 'OPTIONS'],
}

export default defineServiceMiddleware([
  useLogRequest(),
  useCorsHeaders(useCorsHeadersOptions),
  useSession({
    activity: 'get-marketing-default-landing-route',
  }),

  // Render the home page
  async (context) => {

    return void context.serverResponse.sendOKHTMLResponse(
      <Home />
    );
  }
])
