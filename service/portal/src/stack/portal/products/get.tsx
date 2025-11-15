import { UseAccessTokenCookieOptions, useAccessTokenCookie } from "@tw050x.net.library/authentication/middleware/use-access-token-cookie";
import { UseLoginStateCookieOptions, useLoginStateCookie } from "@tw050x.net.library/authentication/middleware/use-login-state-cookie";
import { read as readConfig } from "@tw050x.net.library/configs";
import { UseCorsHeadersFactoryOptions, useCorsHeaders } from "@tw050x.net.library/cors/use-cors-headers";
import { useLogRequest } from "@tw050x.net.library/middleware";
import { read as readSecret } from "@tw050x.net.library/secrets";
import { defineServiceMiddleware } from "@tw050x.net.library/service";
import { useAuthGate } from "../../../middleware/use-auth-gate.js";
import { UseUIStateCookieOptions, useUIStateCookie } from "../../../middleware/use-ui-state.js";
import { default as Products, Props as ProductsDocumentProps } from "../../../template/document/Products.js";

const useCorsHeadersOptions: UseCorsHeadersFactoryOptions = {
  allowedMethods: ['GET', 'OPTIONS'],
  allowedOrigins: readConfig('service.portal.allowed-origins'),
}

const useAccessTokenCookieOptions: UseAccessTokenCookieOptions = {
  cookieName: readConfig('cookie.access-token.name'),
  cookieDomain: readConfig('cookie.access-token.domain'),
  requiredPermissions: [
    'read:portal:users-page',
  ],
  jwtSecretKey: readSecret('jwt.secret-key'),
}

const useLoginStateCookieOptions: UseLoginStateCookieOptions = {
  cookieName: readConfig('cookie.login-state.name'),
  cookieDomain: readConfig('cookie.login-state.domain'),
  encrypterSecretKey: readSecret('encrypter.secret-key'),
}

const useUIStateCookieOptions: UseUIStateCookieOptions = {
  cookieName: readConfig('cookie.ui.portal.state.name'),
  cookieDomain: readConfig('cookie.ui.portal.state.domain'),
}

export default defineServiceMiddleware([
  useLogRequest(),
  useCorsHeaders(useCorsHeadersOptions),
  useAccessTokenCookie(useAccessTokenCookieOptions),
  useLoginStateCookie(useLoginStateCookieOptions),
  useAuthGate(),
  useUIStateCookie(useUIStateCookieOptions),
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
