import { logger } from "@tw050x.net.library/logger";
import { Middleware, ServiceRequestContext } from "@tw050x.net.library/service";
import { default as Unrecoverable } from "@tw050x.net.library/uikit/document/Unrecoverable";
import { default as Cookies } from "cookies";
import { addDays, differenceInSeconds } from "date-fns";

/**
 *
 */
type UIUserTableToolsStateCookie = {
  raw?: string;
  state: 'open' | 'collapsed';
}

/**
 *
 */
export type UseUIUserTableToolsStateCookieOptions = {
  cookieName: string;
  cookieDomain: string;
}

/**
 *
 */
export type UseUIUserTableToolsStateCookieResultingContext = ServiceRequestContext & {
  incomingMessage: ServiceRequestContext['incomingMessage'] & {
    uiUserTableToolsStateCookie: UIUserTableToolsStateCookie;
  }
  serverResponse: ServiceRequestContext['serverResponse'] & {
    uiUserTableToolsStateCookie: {
      clear: () => void;
      set: (value: string) => void;
    }
  }
}

/**
 *
 */
type Factory = (options: UseUIUserTableToolsStateCookieOptions) => Middleware<
  ServiceRequestContext,
  UseUIUserTableToolsStateCookieResultingContext
>

/**
 * @returns void
 */
export const useUIUserTableToolsStateCookie: Factory = (options) => async (context) => {

  // retrieve the cookie name
  cookieNameGuard: {
    if (options.cookieName !== '') {
      break cookieNameGuard;
    }
    logger.error(new Error('access token cookie name is undefined or empty'));
    return void context.serverResponse.sendInternalServerErrorHTMLResponse(<Unrecoverable />);
  }

  // retrieve the cookie domain
  cookieDomainGuard: {
    if (options.cookieDomain !== '') {
      break cookieDomainGuard;
    }
    logger.error(new Error('access token cookie name is undefined or empty'));
    return void context.serverResponse.sendInternalServerErrorHTMLResponse(<Unrecoverable />);
  }

  //
  const cookies = new Cookies(context.incomingMessage, context.serverResponse, {
    secure: true,
  });
  const cookie = cookies.get(options.cookieName);

  // extend the cookie expiration by 30 days if it exists
  context.incomingMessage.uiUserTableToolsStateCookie = {
    raw: cookie,
    state: cookie === 'open' ? 'open' : 'collapsed',
  }

  //
  const clearUIUserTableToolsStateCookie = () => {
    cookies.set(options.cookieName, '', {
      domain: options.cookieDomain,
      httpOnly: false,
      path: '/',
      sameSite: 'lax',
      secure: true,
    });
  }

  //
  const setUIUserTableToolsStateCookie = (value: string) => {
    const currentDate = new Date();
    const expiryDate = addDays(currentDate, 7);
    const maxAgeInSeconds = differenceInSeconds(expiryDate, currentDate);
    const maxAgeInMilliseconds = maxAgeInSeconds * 1000;
    cookies.set(options.cookieName, value, {
      domain: options.cookieDomain,
      httpOnly: false,
      maxAge: maxAgeInMilliseconds,
      path: '/',
      sameSite: 'lax',
      secure: true,
    });
  }

  // initialize the cookies object on the incoming message
  context.serverResponse.uiUserTableToolsStateCookie = {
    clear: clearUIUserTableToolsStateCookie,
    set: setUIUserTableToolsStateCookie
  };
}
