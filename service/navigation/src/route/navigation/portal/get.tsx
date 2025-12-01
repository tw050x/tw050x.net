import { database as accountDatabase } from "@tw050x.net.library/database/client/account";
import { database as assignmentDatabase } from "@tw050x.net.library/database/client/assignment";
import { useLoginState } from "@tw050x.net.library/platform/middleware/use-login-state";
import { sanitizeMongoDBFilterOrPipeline } from "@tw050x.net.library/database";
import { logger } from "@tw050x.net.library/platform/helper/logger";
import { useCorsHeaders, UseCorsHeadersFactoryOptions } from "@tw050x.net.library/platform/middleware/use-cors-headers";
import { useLogRequest } from "@tw050x.net.library/platform/middleware/use-log-request";
import { default as defineServiceMiddleware } from "@tw050x.net.library/platform/middleware";
import { useSession } from "@tw050x.net.library/platform/middleware/use-session";
import { useSessionGate } from "@tw050x.net.library/platform/middleware/use-session-gate";
import { default as UnrecoverableDocument } from "@tw050x.net.library/platform/template/document/Unrecoverable";
import { default as Brands } from "@tw050x.net.library/platform/template/svg/Brands";
import { default as Dashboard } from "@tw050x.net.library/platform/template/svg/Dashboard";
import { default as Products } from "@tw050x.net.library/platform/template/svg/Products";
import { default as Cookies } from "cookies";
import { default as PortalMenu, Props as PortalMenuProps } from "../../../template/component/PortalMenu.js";

const useCorsHeadersOptions: UseCorsHeadersFactoryOptions = {
  allowedMethods: ['GET', 'OPTIONS'],
}

export default defineServiceMiddleware([
  useLogRequest(),
  useCorsHeaders(useCorsHeadersOptions),
  useLoginState(),
  useSession({
    activity: 'get-navigation-portal-menu-route',
  }),
  useSessionGate(),

  //
  async (context) => {
    const cookies = new Cookies(context.incomingMessage, context.serverResponse);

    // Fetch assignments to determine if there are any pending ones
    let incompleteAssignmentDocuments;
    try {
      incompleteAssignmentDocuments = await assignmentDatabase.task.countDocuments(
        sanitizeMongoDBFilterOrPipeline({
          completed: false,
          userProfileUuid: context.incomingMessage.session.userProfileUuid,
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
            userProfileUuid: context.incomingMessage.session.userProfileUuid,
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
      IconComponent: Dashboard,
      href: '/portal/dashboard',
      label: 'Dashboard',
      disabled: hasActiveBillingAccount === false,
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

    //
    const portalMenuProps: PortalMenuProps = {
      menuState,
      serviceMenuItems,
    }
    return void context.serverResponse.sendOKHTMLResponse(<PortalMenu {...portalMenuProps} />);
  }
])
