import { UseAccessTokenCookieOptions, useAccessTokenCookie } from "@tw050x.net.library/user/middleware/use-access-token-cookie";
import { useLoginStateCookie } from "@tw050x.net.library/user/middleware/use-login-state-cookie";
import { UseCorsHeadersFactoryOptions, useCorsHeaders } from "@tw050x.net.library/cors/use-cors-headers";
import { useLogRequest } from "@tw050x.net.library/middleware";
import { defineServiceMiddleware } from "@tw050x.net.library/service";
import { useAuthGate } from "../../../middleware/use-auth-gate.js";
import { useUIStateCookie } from "../../../middleware/use-ui-state.js";
import { default as Settings, Props as SettingsDocumentProps } from "../../../template/document/Settings.js";

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
  useUIStateCookie(),

  //
  async (context) => {
    const settingsDocumentProps: SettingsDocumentProps = {
      menuInitiatorProps: {
        state: context.incomingMessage.uiStateCookie.state.menu.open ? 'open' : 'collapsed',
      }
    }
    return void context.serverResponse.sendOKHTMLResponse(<Settings {...settingsDocumentProps} />);
  }
])
