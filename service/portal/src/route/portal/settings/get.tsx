import { useLoginState } from "@tw050x.net.library/platform/middleware/use-login-state";
import { UseCorsHeadersFactoryOptions, useCorsHeaders } from "@tw050x.net.library/platform/middleware/use-cors-headers";
import { useLogRequest } from "@tw050x.net.library/platform/middleware/use-log-request";
import { default as defineServiceMiddleware } from "@tw050x.net.library/platform/middleware";
import { useUIStateCookie } from "../../../middleware/use-ui-state.js";
import { default as Settings, Props as SettingsDocumentProps } from "../../../template/document/Settings.js";

const useCorsHeadersOptions: UseCorsHeadersFactoryOptions = {
  allowedMethods: ['GET', 'OPTIONS'],
}

export default defineServiceMiddleware([
  useLogRequest(),
  useCorsHeaders(useCorsHeadersOptions),
  useLoginState(),
  useUIStateCookie(),

  // Render the settings page
  async (context) => {
    const settingsDocumentProps: SettingsDocumentProps = {
      menuInitiatorProps: {
        state: context.incomingMessage.uiStateCookie.state.menu.open ? 'open' : 'collapsed',
      }
    }
    return void context.serverResponse.sendOKHTMLResponse(<Settings {...settingsDocumentProps} />);
  }
])
