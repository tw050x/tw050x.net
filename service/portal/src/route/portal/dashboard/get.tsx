import { UseCorsHeadersFactoryOptions, useCorsHeaders } from "@tw050x.net.library/cors/use-cors-headers";
import { useLogRequest } from "@tw050x.net.library/middleware";
import { defineServiceMiddleware } from "@tw050x.net.library/service";
import { useSession } from "@tw050x.net.library/sessions/middleware/use-session";
import { useSessionGate } from "@tw050x.net.library/sessions/middleware/use-session-gate";
import { useLoginState } from "@tw050x.net.library/user/middleware/use-login-state";
import { useUIStateCookie } from "../../../middleware/use-ui-state.js";
import { default as DashboardDocument, Props as DashboardDocumentProps } from "../../../template/document/Dashboard.js";

const useCorsHeadersOptions: UseCorsHeadersFactoryOptions = {
  allowedMethods: ['GET', 'OPTIONS'],
}

export default defineServiceMiddleware([
  useLogRequest(),
  useCorsHeaders(useCorsHeadersOptions),
  useLoginState(),
  useUIStateCookie(),
  useSession({
    activity: 'get-portal-dashboard-route',
  }),
  useSessionGate(),

  // Render the dashboard document
  async (context) => {
    const dashboardDocumentProps: DashboardDocumentProps = {
      menuInitiatorProps: {
        state: context.incomingMessage.uiStateCookie.state.menu.open ? 'open' : 'collapsed',
      },
    }
    return void context.serverResponse.sendOKHTMLResponse(<DashboardDocument {...dashboardDocumentProps} />);
  }
])
