import { UseAccessTokenCookieOptions, useAccessTokenCookie } from "@tw050x.net.library/authentication/middleware/use-access-token-cookie";
import { UseLoginStateCookieOptions, useLoginStateCookie } from "@tw050x.net.library/authentication/middleware/use-login-state-cookie";
import { UseUIMenuStateCookieOptions, useUIMenuStateCookie } from "@tw050x.net.library/middleware/use-ui-menu-state-cookie";
import { UseUIUserTableToolsStateCookieOptions, useUIUserTableToolsStateCookie } from "@tw050x.net.library/middleware/use-ui-user-table-tools-state-cookie";
import { UseCorsHeadersFactoryOptions, useCorsHeaders } from "@tw050x.net.library/cors/use-cors-headers";
import { useLogRequest } from "@tw050x.net.library/middleware";
import { defineServiceMiddleware } from "@tw050x.net.library/service";
import { useAuthGate } from "../../../middleware/use-auth-gate.js";
import { default as Users, Props as UsersDocumentProps } from "../../../template/document/Users.js";
import { serviceParameters } from "../../../parameters.js";
import { serviceSecrets } from "../../../secrets.js";

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

const useUIMenuStateCookieOptions: UseUIMenuStateCookieOptions = {
  cookieName: serviceParameters.getParameter('cookie.ui.menu.state.name'),
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
  useUIMenuStateCookie(useUIMenuStateCookieOptions),
  useUIUserTableToolsStateCookie(useUIUserTableToolsStateCookieOptions),
  async (context) => {
    const usersDocumentProps: UsersDocumentProps = {
      menuInitiatorProps: {
        state: context.incomingMessage.uiMenuStateCookie.state,
      },
      userTableProps: {},
      userTableToolsProps: {
        state: context.incomingMessage.uiUserTableToolsStateCookie.state,
      }
    }
    return void context.serverResponse.sendOKHTMLResponse(<Users {...usersDocumentProps} />);
  }
])
