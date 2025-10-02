import { useParameter, readParameter } from "@tw050x.net.library/configuration";
import { useAccessTokenCookieReader, UseAccessTokenCookieReaderOptions } from "@tw050x.net.library/middleware/use-access-token-cookie-reader";
import { useLoginStateCookieWriter, UseLoginStateCookieWriterOptions } from "@tw050x.net.library/middleware/use-login-state-cookie-writer";
import { useUIUserTableToolsStateCookieReader, UseUIUserTableToolsStateCookieReaderOptions } from "@tw050x.net.library/middleware/use-ui-user-table-tools-state-cookie-reader";
import { useUIUserTableToolsStateCookieWriter, UseUIUserTableToolsStateCookieWriterOptions } from "@tw050x.net.library/middleware/use-ui-user-table-tools-state-cookie-writer";
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

const useAccessTokenCookieReaderOptions: UseAccessTokenCookieReaderOptions = {
  cookieName: useParameter('cookie.access-token.name'),
  requiredPermissions: [
    'read:portal:users-page',
  ],
  jwtSecretKey: useSecret('jwt.secret-key'),
}

const useLoginStateCookieWriterOptions: UseLoginStateCookieWriterOptions = {
  cookieName: useParameter('cookie.login-state.name'),
  cookieDomain: useParameter('cookie.login-state.domain'),
  encrypterSecretKey: useSecret('encrypter.secret-key'),
}

const useUIUserTableToolsStateCookieReaderOptions: UseUIUserTableToolsStateCookieReaderOptions = {
  cookieName: useParameter('cookie.ui.user-table-tools.state.name'),
}

const useUIUserTableToolsStateCookieWriterOptions: UseUIUserTableToolsStateCookieWriterOptions = {
  cookieName: useParameter('cookie.ui.user-table-tools.state.name'),
  cookieDomain: useParameter('cookie.ui.user-table-tools.state.domain'),
}

export default defineServiceMiddleware([
  useLogRequest(),
  useCorsHeaders(useCorsHeadersOptions),
  useAccessTokenCookieReader(useAccessTokenCookieReaderOptions),
  useLoginStateCookieWriter(useLoginStateCookieWriterOptions),
  useAuthGate(),
  useUIUserTableToolsStateCookieReader(useUIUserTableToolsStateCookieReaderOptions),
  useUIUserTableToolsStateCookieWriter(useUIUserTableToolsStateCookieWriterOptions),
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
