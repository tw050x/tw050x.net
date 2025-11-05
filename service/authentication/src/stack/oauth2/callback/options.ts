import { useParameter } from "@tw050x.net.library/configuration";
import { UseCorsHeadersFactoryOptions, useCorsHeaders } from "@tw050x.net.library/middleware/use-cors-headers";
import { useLogRequest } from "@tw050x.net.library/middleware/use-log-request";
import { defineServiceMiddleware } from "@tw050x.net.library/service";

const useCorsHeadersOptions: UseCorsHeadersFactoryOptions = {
  allowedMethods: ['GET', 'OPTIONS'],
  allowedOrigins: useParameter('authentication.service.allowed-origins'),
}

export default defineServiceMiddleware([
  useLogRequest(),
  useCorsHeaders(useCorsHeadersOptions),
])
