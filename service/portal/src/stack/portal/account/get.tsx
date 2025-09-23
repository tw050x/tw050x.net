import { useAccessTokenCookieReader } from "@tw050x.net.library/middleware/use-access-token-cookie-reader";
import { useLoginStateCookieWriter } from "@tw050x.net.library/middleware/use-login-state-cookie-writer";
import { useUIMenuStateCookieReader } from "@tw050x.net.library/middleware/use-ui-menu-state-cookie-reader";
import { useUIUserTableToolsStateCookieReader } from "@tw050x.net.library/middleware/use-ui-user-table-tools-state-cookie-reader";
import { useCors } from "@tw050x.net.library/middleware/use-cors";
import { logger } from "@tw050x.net.library/logger";
import { defineServiceMiddleware } from "@tw050x.net.library/service";
import { sendOKHTMLResponse} from "@tw050x.net.library/service/helper/response/send-ok-html-response";
import { authGate } from "../../../middleware/auth-gate";
import { default as Account, Props as AccountDocumentProps } from "../../../template/document/Account";

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
  useUIMenuStateCookieReader({
    getConfiguration: async ({ configuration }) => ({
      cookieName: configuration.get('cookie.ui.menu.state.name'),
    }),
  }),
  useUIUserTableToolsStateCookieReader({
    getConfiguration: async ({ configuration }) => ({
      cookieName: configuration.get('cookie.ui.user-table-tools.state.name'),
    }),
  }),
  async (context) => {
    const accountDocumentProps: AccountDocumentProps = {
      menuInitiatorProps: {
        state: context.incomingMessage.uiMenuStateCookie.state,
      }
    }
    return void sendOKHTMLResponse(context, await <Account {...accountDocumentProps} />);
  }
])
