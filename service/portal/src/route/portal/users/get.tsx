import { useLoginState } from "@tw050x.net.library/platform/middleware/use-login-state";
import { UseCorsHeadersFactoryOptions, useCorsHeaders } from "@tw050x.net.library/platform/middleware/use-cors-headers";
import { useLogRequest } from "@tw050x.net.library/platform/middleware/use-log-request";
import { default as defineServiceMiddleware } from "@tw050x.net.library/platform/middleware";
import { useSession } from "@tw050x.net.library/platform/middleware/use-session";
import { useSessionGate } from "@tw050x.net.library/platform/middleware/use-session-gate";
import { useUIStateCookie } from "../../../middleware/use-ui-state.js";
import { default as Users, Props as UsersDocumentProps } from "../../../template/document/Users.js";

const useCorsHeadersOptions: UseCorsHeadersFactoryOptions = {
  allowedMethods: ['GET', 'OPTIONS'],
}

export default defineServiceMiddleware([
  useLogRequest(),
  useCorsHeaders(useCorsHeadersOptions),
  useLoginState(),
  useSession({
    activity: 'get-portal-users-route',
  }),
  useSessionGate(),
  useUIStateCookie(),

  // Render users page
  async (context) => {
    const usersDocumentProps: UsersDocumentProps = {
      menuInitiatorProps: {
        state: context.incomingMessage.uiStateCookie.state.menu.open ? 'open' : 'collapsed',
      },
      userTableProps: {},
      userTableToolsProps: {
        state: context.incomingMessage.uiStateCookie.state.userTableTools.open ? 'open' : 'collapsed',
      }
    }
    return void context.serverResponse.sendOKHTMLResponse(<Users {...usersDocumentProps} />);
  }
])
