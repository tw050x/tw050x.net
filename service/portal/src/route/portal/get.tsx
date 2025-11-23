import { useAccessTokenCookie, UseAccessTokenCookieOptions } from "@tw050x.net.library/user/middleware/use-access-token-cookie";
import { useLoginStateCookie } from "@tw050x.net.library/user/middleware/use-login-state-cookie";
import { read as readConfig } from "@tw050x.net.library/configs";
import { useCorsHeaders, UseCorsHeadersFactoryOptions } from "@tw050x.net.library/cors/use-cors-headers";
import { useLogRequest } from "@tw050x.net.library/middleware";
import { defineServiceMiddleware } from "@tw050x.net.library/service";
import { useAuthGate } from "../../middleware/use-auth-gate.js";

const useCorsHeadersOptions: UseCorsHeadersFactoryOptions = {
  allowedMethods: ['GET', 'OPTIONS'],
}

const useAccessTokenCookieOptions: UseAccessTokenCookieOptions = {
  requiredPermissions: [
    'read:portal:users-page',
  ],
}

export default defineServiceMiddleware([
  useLogRequest(),
  useCorsHeaders(useCorsHeadersOptions),
  useAccessTokenCookie(useAccessTokenCookieOptions),
  useLoginStateCookie(),
  useAuthGate(),
  async (context) => {
    return void context.serverResponse.sendMovedPermanentlyRedirect(
      new URL('/portal/dashboard', `https://${readConfig('service.*.host')}`)
    );
  }
])
