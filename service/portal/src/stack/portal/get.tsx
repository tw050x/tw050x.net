import { useParameter, readParameter } from "@tw050x.net.library/configuration";
import { useAccessTokenCookieReader, UseAccessTokenCookieReaderOptions } from "@tw050x.net.library/middleware/use-access-token-cookie-reader";
import { useLoginStateCookieWriter, UseLoginStateCookieWriterOptions } from "@tw050x.net.library/middleware/use-login-state-cookie-writer";
import { useCorsHeaders, UseCorsHeadersFactoryOptions } from "@tw050x.net.library/middleware/use-cors-headers";
import { useLogRequest } from "@tw050x.net.library/middleware";
import { useSecret } from "@tw050x.net.library/secret";
import { defineServiceMiddleware } from "@tw050x.net.library/service";
import { sendMovedPermanentlyRedirect} from "@tw050x.net.library/service/helper/redirect/send-moved-permanently-redirect";
import { useAuthGate } from "../../middleware/use-auth-gate";

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

export default defineServiceMiddleware([
  useLogRequest(),
  useCorsHeaders(useCorsHeadersOptions),
  useAccessTokenCookieReader(useAccessTokenCookieReaderOptions),
  useLoginStateCookieWriter(useLoginStateCookieWriterOptions),
  useAuthGate(),
  async (context) => {
    return void sendMovedPermanentlyRedirect(
      context,
      new URL('/portal/dashboard', `https://${await readParameter('portal.service.host')}`)
    );
  }
])
