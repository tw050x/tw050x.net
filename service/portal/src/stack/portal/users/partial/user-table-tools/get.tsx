import { UseAccessTokenCookieOptions, useAccessTokenCookie } from "@tw050x.net.library/authentication/middleware/use-access-token-cookie";
import { UseLoginStateCookieOptions, useLoginStateCookie } from "@tw050x.net.library/authentication/middleware/use-login-state-cookie";
import { UseUIUserTableToolsStateCookieOptions, useUIUserTableToolsStateCookie } from "@tw050x.net.library/middleware/use-ui-user-table-tools-state-cookie";
import { useCorsHeaders, UseCorsHeadersFactoryOptions } from "@tw050x.net.library/cors/use-cors-headers";
import { useLogRequest } from "@tw050x.net.library/middleware";
import { defineServiceMiddleware } from "@tw050x.net.library/service";
import { useAuthGate } from "../../../../../middleware/use-auth-gate.js";
import { default as UserTableTools, Props as UserTableToolsProps } from "../../../../../template/component/UserTableTools.js";
import { serviceParameters } from "../../../../../parameters.js";
import { serviceSecrets } from "../../../../../secrets.js";

const useCorsHeadersOptions: UseCorsHeadersFactoryOptions = {
  allowedMethods: ['GET', 'OPTIONS'],
  allowedOrigins: serviceParameters.getParameter('portal.service.allowed-origins'),
}

const useAccessTokenCookieOptions: UseAccessTokenCookieOptions = {
  cookieName: serviceParameters.getParameter('cookie.access-token.name'),
  cookieDomain: serviceParameters.getParameter('cookie.access-token.domain'),
  requiredPermissions: [
    'read:portal:users-page',
  ],
  jwtSecretKey: serviceSecrets.getSecret('jwt.secret-key'),
}

const useLoginStateCookieOptions: UseLoginStateCookieOptions = {
  cookieName: serviceParameters.getParameter('cookie.login-state.name'),
  cookieDomain: serviceParameters.getParameter('cookie.login-state.domain'),
  encrypterSecretKey: serviceSecrets.getSecret('encrypter.secret-key'),
}

const useUIUserTableToolsStateCookieOptions: UseUIUserTableToolsStateCookieOptions = {
  cookieName: serviceParameters.getParameter('cookie.ui.user-table-tools.state.name'),
  cookieDomain: serviceParameters.getParameter('cookie.ui.user-table-tools.state.domain'),
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
    return void context.serverResponse.sendOKHTMLResponse(<UserTableTools {...userTableToolsProps} />);
  }
])
