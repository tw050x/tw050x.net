import { logger } from "@tw050x.net.library/logger";
import { useCors } from "@tw050x.net.library/middleware/use-cors";
import { defineServiceMiddleware } from "@tw050x.net.library/service";
import { sendOKHTMLResponse } from "@tw050x.net.library/service/helper";
import { default as Menu } from "../../../template/component/Menu";

export default defineServiceMiddleware([
  async (context) => {
    logger.debug(`GET ${context.incomingMessage.url}`);
  },
  useCors({
    getConfiguration: async ({ configuration }) => ({
      allowedMethods: ['GET', 'OPTIONS'],
      allowedOrigins: configuration.get('navigation.service.allowed-origins'),
    }),
  }),
  async (context) => {
    const menuItems = [
      { label: 'Dashboard', href: '/admin/dashboard' },
      { label: 'Users', href: '/admin/users' },
    ]

    return void sendOKHTMLResponse(context, await <Menu items={menuItems} />);
  }
])
