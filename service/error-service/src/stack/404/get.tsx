import { logger } from "@tw050x.net/logger-library";
import { useCors } from "@tw050x.net/middleware-library/use-cors";
import { defineServiceMiddleware } from "@tw050x.net/service-library";
import { sendOKHTMLResponse } from "@tw050x.net/service-library/helper/response/send-ok-html-response";
import { default as NotFoundDocument } from "../../template/document/NotFound";

export default defineServiceMiddleware([
  async (context) => {
    logger.debug(`GET ${context.incomingMessage.url}`);
  },
  useCors({
    getConfiguration: async (configuration) => ({
      allowedMethods: ['GET', 'OPTIONS'],
      allowedOrigins: configuration.get('error.service.allowed-origins'),
    }),
  }),

  // user is not authenticated and does not have a valid refresh token
  async (context) => {
    return void sendOKHTMLResponse(context, await <NotFoundDocument />);
  }
])
