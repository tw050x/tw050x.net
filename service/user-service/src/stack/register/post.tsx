import { logger } from "@tw050x.net/logger-library";
import { useCors } from "@tw050x.net/middleware-library/use-cors"
import { defineServiceMiddleware } from "@tw050x.net/service-library";
import { sendOKHTMLResponse } from "@tw050x.net/service-library/helper/response/send-ok-html-response";

export default defineServiceMiddleware([
  async (context) => {
    logger.debug(`POST ${context.incomingMessage.url}`);
  },
  useCors({
    getConfiguration: async (configuration) => ({
      allowedMethods: ['GET', 'OPTIONS', 'POST'],
      allowedOrigins: configuration.get('user.service.allowed-origins')
    })
  }),
  async (context) => {
    return sendOKHTMLResponse(context, await <div>User registered successfully</div>);
  }
])
