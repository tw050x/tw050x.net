import { useAccessTokenCookieReader } from "@tw050x.net.library/middleware/use-access-token-cookie-reader";
import { useLoginStateCookieWriter } from "@tw050x.net.library/middleware/use-login-state-cookie-writer";
import { useUIUserTableToolsStateCookieReader } from "@tw050x.net.library/middleware/use-ui-user-table-tools-state-cookie-reader";
import { useUIUserTableToolsStateCookieWriter } from "@tw050x.net.library/middleware/use-ui-user-table-tools-state-cookie-writer";
import { useCors } from "@tw050x.net.library/middleware/use-cors";
import { logger } from "@tw050x.net.library/logger";
import { defineServiceMiddleware } from "@tw050x.net.library/service";
import { sendOKHTMLResponse} from "@tw050x.net.library/service/helper/response/send-ok-html-response";
import { authGate } from "../../../../../middleware/auth-gate";
import { default as UserTableTools, Props as UserTableToolsProps } from "../../../../../template/component/UserTableTools";

export default defineServiceMiddleware([
  async (context) => {
    logger.debug(`GET ${context.incomingMessage.url}`);
  },
  useCors({
    getConfiguration: async ({ configuration }) => ({
      allowedMethods: ['GET', 'OPTIONS'],
      allowedOrigins: configuration.get('portal.service.allowed-origins'),
    })
  }),
  useAccessTokenCookieReader({
    getConfiguration: async ({ configuration }) => ({
      cookieName: configuration.get('cookie.access-token.name'),
      requiredPermissions: [
        'read:portal:users-page',
      ]
    }),
    getSecrets: async ({ secrets }) => ({
      jwtSecretKey: secrets.get('jwt.secret-key'),
    }),
  }),
  useLoginStateCookieWriter({
    getConfiguration: async ({ configuration }) => ({
      cookieName: configuration.get('cookie.login-state.name'),
      cookieDomain: configuration.get('cookie.login-state.domain'),
    }),
    getSecrets: async ({ secrets }) => ({
      encrypterSecretKey: secrets.get('encrypter.secret-key'),
    }),
  }),
  authGate(),
  useUIUserTableToolsStateCookieReader({
    getConfiguration: async ({ configuration }) => ({
      cookieName: configuration.get('cookie.ui.user-table-tools.state.name'),
    }),
  }),
  useUIUserTableToolsStateCookieWriter({
    getConfiguration: async ({ configuration }) => ({
      cookieName: configuration.get('cookie.ui.user-table-tools.state.name'),
      cookieDomain: configuration.get('cookie.ui.user-table-tools.state.domain'),
    }),
  }),
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
