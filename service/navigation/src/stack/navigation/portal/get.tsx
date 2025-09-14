import { logger } from "@tw050x.net.library/logger";
import { useCors } from "@tw050x.net.library/middleware/use-cors";
import { defineServiceMiddleware } from "@tw050x.net.library/service";
import { sendOKHTMLResponse } from "@tw050x.net.library/service/helper";
import { default as Cookies } from "cookies";
import { default as Brands } from "@tw050x.net.library/uikit/svg/Brands";
import { default as Dashboard } from "@tw050x.net.library/uikit/svg/Dashboard";
import { default as Products } from "@tw050x.net.library/uikit/svg/Products";
import { default as Users} from "@tw050x.net.library/uikit/svg/Users";
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
    const cookies = new Cookies(context.incomingMessage, context.serverResponse);

    // TODO: fetch menu items from a database
    const menuItems = [
      { label: 'Dashboard', href: '/portal/dashboard', IconComponent: Dashboard },
      { label: 'Brands', href: '/portal/brands', IconComponent: Brands },
      { label: 'Products', href: '/portal/products', IconComponent: Products },
      { label: 'Users', href: '/portal/users', IconComponent: Users },
    ]

    // determine what menu state to set
    const menuStateCookieValue = cookies.get('ui.menu.state');
    let menuState: 'open' | 'collapsed';
    switch (menuStateCookieValue) {
      case 'open':
      case 'collapsed':
        menuState = menuStateCookieValue;
        break;
      case undefined:
      default:
        menuState = 'open';
    }

    return void sendOKHTMLResponse(context, await <Menu items={menuItems} state={menuState} />);
  }
])
