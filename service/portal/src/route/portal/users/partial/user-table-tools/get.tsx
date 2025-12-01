import { useLoginState } from "@tw050x.net.library/platform/middleware/use-login-state";
import { useCorsHeaders, UseCorsHeadersFactoryOptions } from "@tw050x.net.library/platform/middleware/use-cors-headers";
import { useLogRequest } from "@tw050x.net.library/platform/middleware/use-log-request";
import { default as defineServiceMiddleware } from "@tw050x.net.library/platform/middleware";
import { useSession } from "@tw050x.net.library/platform/middleware/use-session";
import { useSessionGate } from "@tw050x.net.library/platform/middleware/use-session-gate";
import { useUIStateCookie } from "../../../../../middleware/use-ui-state.js";
import { default as UserTableTools, Props as UserTableToolsProps } from "../../../../../template/component/UserTableTools.js";

const useCorsHeadersOptions: UseCorsHeadersFactoryOptions = {
  allowedMethods: ['GET', 'OPTIONS'],
}

export default defineServiceMiddleware([
  useLogRequest(),
  useCorsHeaders(useCorsHeadersOptions),
  useLoginState(),
  useSession({
    activity: 'get-portal-user-table-tools-partial-route',
  }),
  useSessionGate(),
  useUIStateCookie(),

  // render the user table tools partial
  async (context) => {
    const userTableToolsProps: UserTableToolsProps = {
      state: 'open',
    }
    if (context.incomingMessage.uiStateCookie.state.userTableTools.open === true) {
      context.serverResponse.uiStateCookie.set('userTableTools.open', false);
      userTableToolsProps.state = 'collapsed';
    }
    else {
      context.serverResponse.uiStateCookie.set('userTableTools.open', true);
    }
    return void context.serverResponse.sendOKHTMLResponse(<UserTableTools {...userTableToolsProps} />);
  }
])
