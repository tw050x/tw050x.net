import { logger } from "@tw050x.net/logger-library";
import { useCors } from "@tw050x.net/middleware-library/use-cors";
import { defineServiceMiddleware } from "@tw050x.net/service-library";
import { sendOKHTMLResponse } from "@tw050x.net/service-library/helper/response/send-ok-html-response";
import { default as RegisterDocument } from "../../template/document/RegisterDocument";

export default defineServiceMiddleware([
  async (context) => {
    logger.debug(`GET ${context.incomingMessage.url}`);
  },
  useCors({
    getConfiguration: async (configuration) => ({
      allowedMethods: ['GET', 'POST', 'OPTIONS'],
      allowedOrigins: configuration.get('authentication.service.allowed-origins'),
    }),
  }),
  async (context) => {
    return void sendOKHTMLResponse(context, await <RegisterDocument />);
  }
])
