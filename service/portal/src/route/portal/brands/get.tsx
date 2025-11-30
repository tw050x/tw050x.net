import { UseCorsHeadersFactoryOptions, useCorsHeaders } from "@tw050x.net.library/cors/use-cors-headers";
import { useLogRequest } from "@tw050x.net.library/middleware";
import { defineServiceMiddleware } from "@tw050x.net.library/service";
import { useLoginState } from "@tw050x.net.library/user/middleware/use-login-state";
import { useUIStateCookie } from "../../../middleware/use-ui-state.js";
import { default as Brands, Props as BrandsDocumentProps } from "../../../template/document/Brands.js";

const useCorsHeadersOptions: UseCorsHeadersFactoryOptions = {
  allowedMethods: ['GET', 'OPTIONS'],
}

export default defineServiceMiddleware([
  useLogRequest(),
  useCorsHeaders(useCorsHeadersOptions),
  useLoginState(),
  useUIStateCookie(),

  // Render the brands page
  async (context) => {
    const brandsDocumentProps: BrandsDocumentProps = {
      menuInitiatorProps: {
        state: context.incomingMessage.uiStateCookie.state.menu.open ? 'open' : 'collapsed',
      },
    }
    return void context.serverResponse.sendOKHTMLResponse(<Brands {...brandsDocumentProps} />);
  }
])
