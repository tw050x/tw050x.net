import { UseCorsHeadersFactoryOptions, useCorsHeaders } from "@tw050x.net.library/cors/use-cors-headers";
import { useLogRequest } from "@tw050x.net.library/middleware";
import { defineServiceMiddleware } from "@tw050x.net.library/service";
import { useLoginState } from "@tw050x.net.library/user/middleware/use-login-state";
import { useUIStateCookie } from "../../../middleware/use-ui-state.js";
import { default as Products, Props as ProductsDocumentProps } from "../../../template/document/Products.js";

const useCorsHeadersOptions: UseCorsHeadersFactoryOptions = {
  allowedMethods: ['GET', 'OPTIONS'],
}

export default defineServiceMiddleware([
  useLogRequest(),
  useCorsHeaders(useCorsHeadersOptions),
  useLoginState(),
  useUIStateCookie(),

  // Render the products page
  async (context) => {
    const productsDocumentProps: ProductsDocumentProps = {
      menuInitiatorProps: {
        state: context.incomingMessage.uiStateCookie.state.menu.open ? 'open' : 'collapsed',
      },
    }
    return void context.serverResponse.sendOKHTMLResponse(
      <Products {...productsDocumentProps} />
    );
  }
])
