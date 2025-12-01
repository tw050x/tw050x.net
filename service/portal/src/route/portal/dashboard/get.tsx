import { useLoginState } from "@tw050x.net.library/platform/middleware/use-login-state";
import { UseCorsHeadersFactoryOptions, useCorsHeaders } from "@tw050x.net.library/platform/middleware/use-cors-headers";
import { useLogRequest } from "@tw050x.net.library/platform/middleware/use-log-request";
import { default as defineServiceMiddleware } from "@tw050x.net.library/platform/middleware";
import { useSession } from "@tw050x.net.library/platform/middleware/use-session";
import { useSessionGate } from "@tw050x.net.library/platform/middleware/use-session-gate";
import { useUIStateCookie } from "../../../middleware/use-ui-state.js";
import { default as DashboardDocument, Props as DashboardDocumentProps } from "../../../template/document/Dashboard.js";

const useCorsHeadersOptions: UseCorsHeadersFactoryOptions = {
  allowedMethods: ['GET', 'OPTIONS'],
}

export default defineServiceMiddleware([
  useLogRequest(),
  useCorsHeaders(useCorsHeadersOptions),
  useLoginState(),
  useSession({
    activity: 'get-portal-dashboard-route',
  }),
  useSessionGate(),
  useUIStateCookie(),

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
