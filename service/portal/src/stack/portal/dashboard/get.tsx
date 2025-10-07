import { useParameter } from "@tw050x.net.library/configuration";
import { UseAccessTokenCookieOptions, useAccessTokenCookie } from "@tw050x.net.library/middleware/use-access-token-cookie";
import { UseLoginStateCookieOptions, useLoginStateCookie } from "@tw050x.net.library/middleware/use-login-state-cookie";
import { UseUIMenuStateCookieOptions, useUIMenuStateCookie } from "@tw050x.net.library/middleware/use-ui-menu-state-cookie";
import { UseCorsHeadersFactoryOptions, useCorsHeaders } from "@tw050x.net.library/middleware/use-cors-headers";
import { useLogRequest } from "@tw050x.net.library/middleware";
import { useSecret } from "@tw050x.net.library/secret";
import { defineServiceMiddleware } from "@tw050x.net.library/service";
import { sendOKHTMLResponse } from "@tw050x.net.library/service/helper/response/send-ok-html-response";
import { useAuthGate } from "../../../middleware/use-auth-gate";
import { default as DashboardDocument, Props as DashboardDocumentProps } from "../../../template/document/Dashboard";

const useCorsHeadersOptions: UseCorsHeadersFactoryOptions = {
  allowedMethods: ['GET', 'OPTIONS'],
  allowedOrigins: useParameter('portal.service.allowed-origins'),
}

const useAccessTokenCookieOptions: UseAccessTokenCookieOptions = {
  cookieName: useParameter('cookie.access-token.name'),
  cookieDomain: useParameter('cookie.access-token.domain'),
  requiredPermissions: [
    'read:portal:dashboard-page',
  ],
  jwtSecretKey: useSecret('jwt.secret-key'),
}

const useLoginStateCookieOptions: UseLoginStateCookieOptions = {
  allowedReturnUrlDomains: useParameter('auth.allowed-return-url-domains'),
  cookieName: useParameter('cookie.login-state.name'),
  cookieDomain: useParameter('cookie.login-state.domain'),
  encrypterSecretKey: useSecret('encrypter.secret-key'),
}

const useUIMenuStateCookieOptions: UseUIMenuStateCookieOptions = {
  cookieName: useParameter('cookie.ui.menu.state.name'),
}

export default defineServiceMiddleware([
  useLogRequest(),
  useCorsHeaders(useCorsHeadersOptions),
  useAccessTokenCookie(useAccessTokenCookieOptions),
  useLoginStateCookie(useLoginStateCookieOptions),
  useAuthGate(),
  useUIMenuStateCookie(useUIMenuStateCookieOptions),
  async (context) => {
    const dashboardDocumentProps: DashboardDocumentProps = {
      menuInitiatorProps: {
        state: context.incomingMessage.uiMenuStateCookie.state,
      },
    }
    return void sendOKHTMLResponse(context, await <DashboardDocument {...dashboardDocumentProps} />);
  }
])
