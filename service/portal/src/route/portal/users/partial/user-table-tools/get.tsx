import { useCorsHeaders, UseCorsHeadersFactoryOptions } from "@tw050x.net.library/cors/use-cors-headers";
import { useLogRequest } from "@tw050x.net.library/middleware";
import { defineServiceMiddleware } from "@tw050x.net.library/service";
import { useSession } from "@tw050x.net.library/sessions/middleware/use-session";
import { useSessionGate } from "@tw050x.net.library/sessions/middleware/use-session-gate";
import { useLoginState } from "@tw050x.net.library/user/middleware/use-login-state";
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
