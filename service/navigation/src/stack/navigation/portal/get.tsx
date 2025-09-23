import { logger } from "@tw050x.net.library/logger";
import { useCors } from "@tw050x.net.library/middleware/use-cors";
import { useAccessTokenCookieReader } from "@tw050x.net.library/middleware";
import { defineServiceMiddleware } from "@tw050x.net.library/service";
import { sendOKHTMLResponse } from "@tw050x.net.library/service/helper";
import { default as Account } from "@tw050x.net.library/uikit/svg/Account";
import { default as AccountSwitch } from "@tw050x.net.library/uikit/svg/AccountSwitch";
import { default as Brands } from "@tw050x.net.library/uikit/svg/Brands";
import { default as Dashboard } from "@tw050x.net.library/uikit/svg/Dashboard";
import { default as Products } from "@tw050x.net.library/uikit/svg/Products";
import { default as Profile } from "@tw050x.net.library/uikit/svg/Profile";
import { default as Users } from "@tw050x.net.library/uikit/svg/Users";
import { default as Welcome } from "@tw050x.net.library/uikit/svg/Welcome";
import { default as Cookies } from "cookies";
import { default as Menu, Props as MenuProps } from "../../../template/component/Menu";

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
  useAccessTokenCookieReader({
    getConfiguration: async ({ configuration }) => ({
      cookieName: configuration.get('cookie.access-token.name'),
      requiredPermissions: [],
    }),
    getSecrets: async ({ secrets }) => ({
      jwtSecretKey: secrets.get('jwt.secret-key'),
    }),
  }),
  async (context) => {
    const cookies = new Cookies(context.incomingMessage, context.serverResponse);

    // Determine service menu items
    const serviceMenuItems = [
      { label: 'Welcome', href: '/portal/welcome', IconComponent: Welcome },
      { label: 'Dashboard', href: '/portal/dashboard', IconComponent: Dashboard, disabled: true },
      { label: 'Account', href: '/portal/account', IconComponent: Account },
      { label: 'Brands', href: '/portal/brands', IconComponent: Brands, disabled: true },
      { label: 'Products', href: '/portal/products', IconComponent: Products, disabled: true },
      { label: 'Users', href: '/portal/users', IconComponent: Users, disabled: true },
    ]

    // Determine menu state from cookie
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

    // Determine user menu items
    let userMenuItems = [
      { label: 'Switch Account', src: `/portal/users/profile/${context.incomingMessage.accessTokenCookie.payload?.sub}`, IconComponent: AccountSwitch, disabled: true },
      { label: 'Profile', href: `/portal/users/profile/${context.incomingMessage.accessTokenCookie.payload?.sub}`, IconComponent: Profile },
    ]

    //
    const portalMenuProps: MenuProps = {
      menuState,
      serviceMenuItems,
      userMenuItems,
    }
    return void sendOKHTMLResponse(context, await <Menu {...portalMenuProps} />);
  }
])
