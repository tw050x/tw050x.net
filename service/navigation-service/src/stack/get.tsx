import { logger } from "@tw050x.net/logger-library";
import { useCors } from "@tw050x.net/middleware-library/use-cors";
import { defineServiceMiddleware } from "@tw050x.net/service-library";
import { sendOKHTMLResponse } from "@tw050x.net/service-library/helper";
import { default as HomeDocument } from "../template/document/Home";

export default defineServiceMiddleware([
  async (context) => {
    logger.debug(`GET ${context.incomingMessage.url}`);
  },
  useCors({
    getConfiguration: async (configuration) => ({
      allowedMethods: ['GET', 'OPTIONS'],
      allowedOrigins: configuration.get('marketing.service.allowed-origins'),
    }),
  }),
  async (context) => {
    return void sendOKHTMLResponse(context, await <HomeDocument />);
  }
])
