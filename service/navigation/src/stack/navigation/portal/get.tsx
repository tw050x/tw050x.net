import { parameter } from "@tw050x.net.library/configuration";
import { database as accountDatabase } from "@tw050x.net.database/account";
import { database as assignmentDatabase } from "@tw050x.net.database/assignment";
import { useAccessTokenCookie, UseAccessTokenCookieOptions } from "@tw050x.net.library/authentication/middleware/use-access-token-cookie";
import { UseLoginStateCookieOptions, useLoginStateCookie } from "@tw050x.net.library/authentication/middleware/use-login-state-cookie";
import { sanitizeMongoDBFilterOrPipeline } from "@tw050x.net.library/database";
import { logger } from "@tw050x.net.library/logger";
import { useCorsHeaders, UseCorsHeadersFactoryOptions } from "@tw050x.net.library/cors/use-cors-headers";
import { useLogRequest } from "@tw050x.net.library/middleware/use-log-request";
import { secret } from "@tw050x.net.library/secret";
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
import { default as PortalMenu, Props as PortalMenuProps } from "../../../template/component/PortalMenu.js";

const useCorsHeadersOptions: UseCorsHeadersFactoryOptions = {
  allowedMethods: ['GET', 'OPTIONS'],
  allowedOrigins: parameter('navigation.service.allowed-origins'),
}

const useAccessTokenCookieOptions: UseAccessTokenCookieOptions = {
  cookieName: parameter('cookie.access-token.name'),
  cookieDomain: parameter('cookie.access-token.domain'),
  jwtSecretKey: secret('jwt.secret-key'),
}

const useLoginStateCookieOptions: UseLoginStateCookieOptions = {
  cookieName: parameter('cookie.login-state.name'),
  cookieDomain: parameter('cookie.login-state.domain'),
  encrypterSecretKey: secret('encrypter.secret-key'),
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

    let hasActiveBillingAccount = false;
    try {
      hasActiveBillingAccount = (
        await accountDatabase.billing.countDocuments(
          sanitizeMongoDBFilterOrPipeline({
            userProfileId: context.incomingMessage.accessTokenCookie.payload.sub,
            expiresAt: { $gt: new Date() },
          })
        )
      ) > 0;
    }
    catch (error) {
      logger.debug("Error checking billing account existence");
      logger.error(error);
    }
    logger.debug(`hasActiveBillingAccount: ${hasActiveBillingAccount}`);

    // Determine service menu items
    const serviceMenuItems = []

    // Add default menu items
    serviceMenuItems.push({
      href: '/portal/assignment',
      label: 'Assignments',
      IconComponent: Assignment,
      classes: [
        incompleteAssignmentDocuments > 0 ? 'attention' : ''
      ]
    });
    serviceMenuItems.push({
      IconComponent: Dashboard,
      href: '/portal/dashboard',
      label: 'Dashboard',
    });
    serviceMenuItems.push({
      IconComponent: Brands,
      href: '/portal/brands',
      label: 'Brands',
      disabled: hasActiveBillingAccount === false,
    });
    serviceMenuItems.push({
      IconComponent: Products,
      href: '/portal/products',
      label: 'Products',
      disabled: hasActiveBillingAccount === false,
    });
    serviceMenuItems.push({
      IconComponent: Account,
      href: '/portal/account',
      label: 'Account',
    });
    serviceMenuItems.push({
      IconComponent: Users,
      href: '/portal/users',
      label: 'Users',
    });

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
      { label: 'My Profile', href: `/portal/users/profile/${context.incomingMessage.accessTokenCookie.payload.sub}`, IconComponent: Profile },
    ]

    //
    const portalMenuProps: PortalMenuProps = {
      menuState,
      serviceMenuItems,
      userMenuItems,
    }
    return void context.serverResponse.sendOKHTMLResponse(<PortalMenu {...portalMenuProps} />);
  }
])
