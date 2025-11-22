import { UseAccessTokenCookieOptions, useAccessTokenCookie } from "@tw050x.net.library/user/middleware/use-access-token-cookie";
import { useLoginStateCookie } from "@tw050x.net.library/user/middleware/use-login-state-cookie";
import { UseCorsHeadersFactoryOptions, useCorsHeaders } from "@tw050x.net.library/cors/use-cors-headers";
import { useLogRequest } from "@tw050x.net.library/middleware";
import { useUIStateCookie } from "../../../middleware/use-ui-state.js";
import { defineServiceMiddleware } from "@tw050x.net.library/service";
import { useAuthGate } from "../../../middleware/use-auth-gate.js";
import { default as DashboardDocument, Props as DashboardDocumentProps } from "../../../template/document/Dashboard.js";

const useCorsHeadersOptions: UseCorsHeadersFactoryOptions = {
  allowedMethods: ['GET', 'OPTIONS'],
}

const useAccessTokenCookieOptions: UseAccessTokenCookieOptions = {
  requiredPermissions: [
    'read:portal:dashboard-page',
  ],
}

export default defineServiceMiddleware([
  useLogRequest(),
  useCorsHeaders(useCorsHeadersOptions),
  useAccessTokenCookie(useAccessTokenCookieOptions),
  useLoginStateCookie(),
  useAuthGate(),
  useUIStateCookie(),
  async (context) => {
    const dashboardDocumentProps: DashboardDocumentProps = {
      menuInitiatorProps: {
        state: context.incomingMessage.uiStateCookie.state.menu.open ? 'open' : 'collapsed',
      },
    }
    console.log('Rendering dashboard page for user ID:', context.incomingMessage.accessTokenCookie.payload.sub);
    return void context.serverResponse.sendOKHTMLResponse(<DashboardDocument {...dashboardDocumentProps} />);
  }
])
