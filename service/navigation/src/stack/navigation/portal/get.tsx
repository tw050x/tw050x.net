import { useParameter } from "@tw050x.net.library/configuration";
import { database as assignmentDatabase } from "@tw050x.net.database/assignment";
import { sanitizeMongoDBFilterOrPipeline } from "@tw050x.net.library/database";
import { logger } from "@tw050x.net.library/logger";
import { useAccessTokenCookie, UseAccessTokenCookieOptions } from "@tw050x.net.library/middleware/use-access-token-cookie";
import { UseLoginStateCookieOptions, useLoginStateCookie } from "@tw050x.net.library/middleware/use-login-state-cookie";
import { useCorsHeaders, UseCorsHeadersFactoryOptions } from "@tw050x.net.library/middleware/use-cors-headers";
import { useLogRequest } from "@tw050x.net.library/middleware/use-log-request";
import { useSecret } from "@tw050x.net.library/secret";
import { defineServiceMiddleware } from "@tw050x.net.library/service";
import { default as UnrecoverableDocument } from "@tw050x.net.library/uikit/document/Unrecoverable";
import { default as Account } from "@tw050x.net.library/uikit/svg/Account";
import { default as AccountSwitch } from "@tw050x.net.library/uikit/svg/AccountSwitch";
import { default as Assignment } from "@tw050x.net.library/uikit/svg/Assignment";
import { default as Brands } from "@tw050x.net.library/uikit/svg/Brands";
import { default as Dashboard } from "@tw050x.net.library/uikit/svg/Dashboard";
import { default as Products } from "@tw050x.net.library/uikit/svg/Products";
import { default as Profile } from "@tw050x.net.library/uikit/svg/Profile";
import { default as Users } from "@tw050x.net.library/uikit/svg/Users";
import { default as Cookies } from "cookies";
import { useAuthGate } from "../../../middleware/use-auth-gate.js";
import { default as Menu, Props as MenuProps } from "../../../template/component/Menu.js";

const useCorsHeadersOptions: UseCorsHeadersFactoryOptions = {
  allowedMethods: ['GET', 'OPTIONS'],
  allowedOrigins: useParameter('navigation.service.allowed-origins'),
}

const useAccessTokenCookieOptions: UseAccessTokenCookieOptions = {
  cookieName: useParameter('cookie.access-token.name'),
  cookieDomain: useParameter('cookie.access-token.domain'),
  jwtSecretKey: useSecret('jwt.secret-key'),
}

const useLoginStateCookieOptions: UseLoginStateCookieOptions = {
  cookieName: useParameter('cookie.login-state.name'),
  cookieDomain: useParameter('cookie.login-state.domain'),
  encrypterSecretKey: useSecret('encrypter.secret-key'),
}

export default defineServiceMiddleware([
  useLogRequest(),
  useCorsHeaders(useCorsHeadersOptions),
  useAccessTokenCookie(useAccessTokenCookieOptions),
  useLoginStateCookie(useLoginStateCookieOptions),
  useAuthGate(),

  //
  async (context) => {
    const cookies = new Cookies(context.incomingMessage, context.serverResponse);

    // Fetch assignments to determine if there are any pending ones
    let incompleteAssignmentDocuments;
    try {
      incompleteAssignmentDocuments = await assignmentDatabase.task.countDocuments(
        sanitizeMongoDBFilterOrPipeline({
          userProfileUuid: context.incomingMessage.accessTokenCookie.payload.sub,
          completed: false,
        })
      );
    }
    catch (error) {
      logger.error(error);
      return void context.serverResponse.sendInternalServerErrorHTMLResponse(<UnrecoverableDocument />)
    }

    // Determine service menu items
    const serviceMenuItems = []

    if (incompleteAssignmentDocuments > 0) {
      serviceMenuItems.push({ label: 'Assignments', href: '/portal/assignment', IconComponent: Assignment, classes: ['attention'] });
    }

    // Add default menu items
    serviceMenuItems.push({ label: 'Dashboard', href: '/portal/dashboard', IconComponent: Dashboard });
    serviceMenuItems.push({ label: 'Brands', href: '/portal/brands', IconComponent: Brands });
    serviceMenuItems.push({ label: 'Products', href: '/portal/products', IconComponent: Products });
    serviceMenuItems.push({ label: 'Account', href: '/portal/account', IconComponent: Account });
    serviceMenuItems.push({ label: 'Users', href: '/portal/users', IconComponent: Users });

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
      { label: 'Switch Account', src: `/portal/users/profile/${context.incomingMessage.accessTokenCookie.payload.sub}`, IconComponent: AccountSwitch },
      { label: 'Profile', href: `/portal/users/profile/${context.incomingMessage.accessTokenCookie.payload.sub}`, IconComponent: Profile },
    ]

    //
    const portalMenuProps: MenuProps = {
      menuState,
      serviceMenuItems,
      userMenuItems,
    }
    return void context.serverResponse.sendOKHTMLResponse(<Menu {...portalMenuProps} />);
  }
])
