import { useParameter } from "@tw050x.net.library/configuration";
import { UseAccessTokenCookieReaderOptions, useAccessTokenCookieReader } from "@tw050x.net.library/middleware/use-access-token-cookie-reader";
import { UseLoginStateCookieWriterOptions, useLoginStateCookieWriter } from "@tw050x.net.library/middleware/use-login-state-cookie-writer";
import { UseUIMenuStateCookieReaderOptions, useUIMenuStateCookieReader } from "@tw050x.net.library/middleware/use-ui-menu-state-cookie-reader";
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

const useAccessTokenCookieReaderOptions: UseAccessTokenCookieReaderOptions = {
  cookieName: useParameter('cookie.access-token.name'),
  requiredPermissions: [
    'read:portal:dashboard-page',
  ],
  jwtSecretKey: useSecret('jwt.secret-key'),
}

const useLoginStateCookieWriterOptions: UseLoginStateCookieWriterOptions = {
  cookieName: useParameter('cookie.login-state.name'),
  cookieDomain: useParameter('cookie.login-state.domain'),
  encrypterSecretKey: useSecret('encrypter.secret-key'),
}

const useUIMenuStateCookieReaderOptions: UseUIMenuStateCookieReaderOptions = {
  cookieName: useParameter('cookie.ui.menu.state.name'),
}

export default defineServiceMiddleware([
  useLogRequest(),
  useCorsHeaders(useCorsHeadersOptions),
  useAccessTokenCookieReader(useAccessTokenCookieReaderOptions),
  useLoginStateCookieWriter(useLoginStateCookieWriterOptions),
  useAuthGate(),
  useUIMenuStateCookieReader(useUIMenuStateCookieReaderOptions),
  async (context) => {
    const dashboardDocumentProps: DashboardDocumentProps = {
      menuInitiatorProps: {
        state: context.incomingMessage.uiMenuStateCookie.state,
      },
    }
    return void sendOKHTMLResponse(context, await <DashboardDocument {...dashboardDocumentProps} />);
  }
])
