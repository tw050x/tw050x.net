import { useParameter } from "@tw050x.net.library/configuration";
import { useCorsHeaders, UseCorsHeadersFactoryOptions } from "@tw050x.net.library/middleware/use-cors-headers";
import { useLogRequest } from "@tw050x.net.library/middleware/use-log-request";
import { defineServiceMiddleware } from "@tw050x.net.library/service";
import { sendOKHTMLResponse } from "@tw050x.net.library/service/helper";
import { default as HomeDocument } from "../template/document/Home";

const useCorsHeadersOptions: UseCorsHeadersFactoryOptions = {
  allowedMethods: ['GET', 'OPTIONS'],
  allowedOrigins: useParameter('marketing.service.allowed-origins'),
}

export default defineServiceMiddleware([
  useLogRequest(),
  useCorsHeaders(useCorsHeadersOptions),
  async (context) => {
    return void sendOKHTMLResponse(context, await <HomeDocument />);
  }
])
