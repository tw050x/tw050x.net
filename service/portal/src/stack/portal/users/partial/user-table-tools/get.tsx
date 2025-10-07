import { useParameter } from "@tw050x.net.library/configuration";
import { UseAccessTokenCookieOptions, useAccessTokenCookie } from "@tw050x.net.library/middleware/use-access-token-cookie";
import { UseLoginStateCookieOptions, useLoginStateCookie } from "@tw050x.net.library/middleware/use-login-state-cookie";
import { UseUIUserTableToolsStateCookieOptions, useUIUserTableToolsStateCookie } from "@tw050x.net.library/middleware/use-ui-user-table-tools-state-cookie";
import { useCorsHeaders, UseCorsHeadersFactoryOptions } from "@tw050x.net.library/middleware/use-cors-headers";
import { useLogRequest } from "@tw050x.net.library/middleware";
import { useSecret } from "@tw050x.net.library/secret";
import { defineServiceMiddleware } from "@tw050x.net.library/service";
import { sendOKHTMLResponse} from "@tw050x.net.library/service/helper/response/send-ok-html-response";
import { useAuthGate } from "../../../../../middleware/use-auth-gate";
import { default as UserTableTools, Props as UserTableToolsProps } from "../../../../../template/component/UserTableTools";

const useCorsHeadersOptions: UseCorsHeadersFactoryOptions = {
  allowedMethods: ['GET', 'OPTIONS'],
  allowedOrigins: useParameter('portal.service.allowed-origins'),
}

const useAccessTokenCookieOptions: UseAccessTokenCookieOptions = {
  cookieName: useParameter('cookie.access-token.name'),
  cookieDomain: useParameter('cookie.access-token.domain'),
  requiredPermissions: [
    'read:portal:users-page',
  ],
  jwtSecretKey: useSecret('jwt.secret-key'),
}

const useLoginStateCookieOptions: UseLoginStateCookieOptions = {
  allowedReturnUrlDomains: useParameter('authentication.service.allowed-return-url-domains'),
  cookieName: useParameter('cookie.login-state.name'),
  cookieDomain: useParameter('cookie.login-state.domain'),
  encrypterSecretKey: useSecret('encrypter.secret-key'),
}

const useUIUserTableToolsStateCookieOptions: UseUIUserTableToolsStateCookieOptions = {
  cookieName: useParameter('cookie.ui.user-table-tools.state.name'),
  cookieDomain: useParameter('cookie.ui.user-table-tools.state.domain'),
}

export default defineServiceMiddleware([
  useLogRequest(),
  useCorsHeaders(useCorsHeadersOptions),
  useAccessTokenCookie(useAccessTokenCookieOptions),
  useLoginStateCookie(useLoginStateCookieOptions),
  useAuthGate(),
  useUIUserTableToolsStateCookie(useUIUserTableToolsStateCookieOptions),

  //
  async (context) => {
    const userTableToolsProps: UserTableToolsProps = {
      state: 'open',
    }
    if (context.incomingMessage.uiUserTableToolsStateCookie.state === 'open') {
      context.serverResponse.uiUserTableToolsStateCookie.set('collapsed');
      userTableToolsProps.state = 'collapsed';
    }
    else {
      context.serverResponse.uiUserTableToolsStateCookie.set('open');
    }
    return void sendOKHTMLResponse(context, await <UserTableTools {...userTableToolsProps} />);
  }
])
