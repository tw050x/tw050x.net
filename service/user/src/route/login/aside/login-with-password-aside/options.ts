import { useCorsHeaders } from "@tw050x.net.library/platform/middleware/use-cors-headers";
import { useLogRequest } from "@tw050x.net.library/platform/middleware/use-log-request";
import { default as defineServiceMiddleware } from "@tw050x.net.library/platform/middleware";

export default defineServiceMiddleware([
  useLogRequest(),
  useCorsHeaders({
    allowedMethods: ['GET', 'POST', 'OPTIONS'],
  }),
  async (context) => void context.serverResponse.sendNoContentTextResponse(),
])
