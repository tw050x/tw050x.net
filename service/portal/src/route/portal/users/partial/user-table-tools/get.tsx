import { UseAccessTokenCookieOptions, useAccessTokenCookie } from "@tw050x.net.library/user/middleware/use-access-token-cookie";
import { useLoginStateCookie } from "@tw050x.net.library/user/middleware/use-login-state-cookie";
import { useCorsHeaders, UseCorsHeadersFactoryOptions } from "@tw050x.net.library/cors/use-cors-headers";
import { useLogRequest } from "@tw050x.net.library/middleware";
import { defineServiceMiddleware } from "@tw050x.net.library/service";
import { useAuthGate } from "../../../../../middleware/use-auth-gate.js";
import { useUIStateCookie } from "../../../../../middleware/use-ui-state.js";
import { default as UserTableTools, Props as UserTableToolsProps } from "../../../../../template/component/UserTableTools.js";

const useCorsHeadersOptions: UseCorsHeadersFactoryOptions = {
  allowedMethods: ['GET', 'OPTIONS'],
}

const useAccessTokenCookieOptions: UseAccessTokenCookieOptions = {
  requiredPermissions: [
    'read:portal:users-page',
  ],
}

export default defineServiceMiddleware([
  useLogRequest(),
  useCorsHeaders(useCorsHeadersOptions),
  useAccessTokenCookie(useAccessTokenCookieOptions),
  useLoginStateCookie(),
  useAuthGate(),
  useUIStateCookie(),

  //
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
