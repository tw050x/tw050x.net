import { logger } from "@tw050x.net.library/logger";
import { useCors } from "@tw050x.net.library/middleware/use-cors";
import { defineServiceMiddleware } from "@tw050x.net.library/service";
import { sendOKHTMLResponse } from "@tw050x.net.library/service/helper";
import { default as HomeDocument } from "../template/document/Home";

export default defineServiceMiddleware([
  async (context) => {
    logger.debug(`GET ${context.incomingMessage.url}`);
  },
  useCors({
    getConfiguration: async ({ configuration }) => ({
      allowedMethods: ['GET', 'OPTIONS'],
      allowedOrigins: configuration.get('marketing.service.allowed-origins'),
    }),
  }),
  async (context) => {
    return void sendOKHTMLResponse(context, await <HomeDocument />);
  }
])
