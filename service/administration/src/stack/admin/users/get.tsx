import { useAccessTokenCookieReader } from "@tw050x.net.library/middleware/use-access-token-cookie-reader";
import { useLoginStateCookieWriter } from "@tw050x.net.library/middleware/use-login-state-cookie-writer";
import { useCors } from "@tw050x.net.library/middleware/use-cors";
import { logger } from "@tw050x.net.library/logger";
import { defineServiceMiddleware } from "@tw050x.net.library/service";
import { sendOKHTMLResponse} from "@tw050x.net.library/service/helper/response/send-ok-html-response";
import { authGate } from "../../../middleware/auth-gate";
import { default as DashboardDocument } from "../../../template/document/Dashboard";

export default defineServiceMiddleware([
  async (context) => {
    logger.debug(`GET ${context.incomingMessage.url}`);
  },
  useCors({
    getConfiguration: async ({ configuration }) => ({
      allowedMethods: ['GET', 'OPTIONS'],
      allowedOrigins: configuration.get('administration.service.allowed-origins'),
    })
  }),
  useAccessTokenCookieReader({
    getConfiguration: async ({ configuration }) => ({
      cookieName: configuration.get('cookie.access-token.name'),
      requiredPermissions: [
        'read:administration:users-page',
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
  async (context) => {
    return void sendOKHTMLResponse(context, await <DashboardDocument />);
  }
])
