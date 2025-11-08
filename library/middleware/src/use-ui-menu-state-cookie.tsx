import { logger } from "@tw050x.net.library/logger";
import { Middleware, ServiceRequestContext } from "@tw050x.net.library/service";
import { default as Unrecoverable } from "@tw050x.net.library/uikit/document/Unrecoverable";
import { default as Cookies } from "cookies";

/**
 *
 */
type UIMenuStateCookie = {
  raw?: string;
  state: 'open' | 'collapsed';
}

/**
 *
 */
export type UseUIMenuStateCookieOptions = {
  cookieName: string;
}

/**
 *
 */
export type UseUIMenuStateCookieResultingContext = ServiceRequestContext & {
  incomingMessage: ServiceRequestContext['incomingMessage'] & {
    uiMenuStateCookie: UIMenuStateCookie;
  }
}

/**
 *
 */
type Factory = (options: UseUIMenuStateCookieOptions) => Middleware<
  ServiceRequestContext,
  UseUIMenuStateCookieResultingContext
>

/**
 * @returns void
 */
export const useUIMenuStateCookie: Factory = (options) => async (context) => {

  // retrieve the cookie name
  cookieNameGuard: {
    if (options.cookieName !== '') {
      break cookieNameGuard;
    }
    logger.error(new Error('access token cookie name is undefined or empty'));
        return void context.serverResponse.sendInternalServerErrorHTMLResponse(<Unrecoverable />);
  }

  //
  const cookies = new Cookies(context.incomingMessage, context.serverResponse, {
    secure: true,
  });
  const cookie = cookies.get(options.cookieName);

  //
  const uiMenuStateCookie: UIMenuStateCookie = {
    raw: cookie,
    state: 'collapsed',
  }
  if (cookie === 'open') {
    uiMenuStateCookie.state = 'open';
  }
  context.incomingMessage.uiMenuStateCookie = uiMenuStateCookie
}
