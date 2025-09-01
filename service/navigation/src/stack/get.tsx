import { logger } from "@tw050x.net/logger";
import { useCors } from "@tw050x.net/middleware/use-cors";
import { defineServiceMiddleware } from "@tw050x.net/service";
import { sendOKHTMLResponse } from "@tw050x.net/service/helper";
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
