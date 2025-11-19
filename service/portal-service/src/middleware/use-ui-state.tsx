import { logger } from "@tw050x.net.library/logger";
import { Middleware, ServiceRequestContext } from "@tw050x.net.library/service";
import { default as Unrecoverable } from "@tw050x.net.library/uikit/document/Unrecoverable";
import { updateJSON } from "@tw050x.net.library/utility/update-json";
import { default as Cookies } from "cookies";
import { addHours, differenceInSeconds } from "date-fns";

/**
 *
 */
type UIStateCookie = {
  raw?: string;
  state: {
    menu: {
      open: boolean;
    }
    userTableTools: {
      open: boolean;
    }
  };
}

/**
 *
 */
export type UseUIStateCookieOptions = {
  cookieName: string;
  cookieDomain: string;
}

/**
 *
 */
export type UseUIStateCookieResultingContext = ServiceRequestContext & {
  incomingMessage: ServiceRequestContext['incomingMessage'] & {
    uiStateCookie: UIStateCookie;
  }
  serverResponse: ServiceRequestContext['serverResponse'] & {
    uiStateCookie: {
      clear: () => void;
      set: (dotPath: string, value: unknown) => void;
    };
  }
}

/**
 *
 */
type Factory = (options: UseUIStateCookieOptions) => Middleware<
  ServiceRequestContext,
  UseUIStateCookieResultingContext
>

/**
 * @returns void
 */
export const useUIStateCookie: Factory = (options) => async (context) => {

  // retrieve the cookie name
  cookieNameGuard: {
    if (options.cookieName !== '') {
      break cookieNameGuard;
    }
    logger.error(new Error('access token cookie name is undefined or empty'));
    return void context.serverResponse.sendInternalServerErrorHTMLResponse(
      <Unrecoverable />
    );
  }

  // read the cookie
  const cookies = new Cookies(context.incomingMessage, context.serverResponse, {
    secure: true,
  });
  const cookie = cookies.get(options.cookieName);

  // create a default ui state cookie
  const uiStateCookie: UIStateCookie = {
    raw: cookie,
    state: {
      menu: {
        open: false,
      },
      userTableTools: {
        open: false,
      },
    },
  }

  // override default state cookie values with those from the cookie string
  const parsedOrEmptyCookieData = JSON.parse(cookie ?? '{}');

  if ('menu' in parsedOrEmptyCookieData) {
    if ('open' in parsedOrEmptyCookieData.menu) {
      uiStateCookie.state.menu.open = parsedOrEmptyCookieData.menu.open === true;
    }
  }

  if ('userTableTools' in parsedOrEmptyCookieData) {
    if ('open' in parsedOrEmptyCookieData.userTableTools) {
      uiStateCookie.state.userTableTools.open = parsedOrEmptyCookieData.userTableTools.open === true;
    }
  }

  context.incomingMessage.uiStateCookie = uiStateCookie

  const clearUIStateCookie = () => {
    cookies.set(options.cookieName, '', {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      domain: options.cookieDomain,
      path: '/',
    });
  }

  const setUIStateCookie = (dotPath: string, value: unknown) => {
    const updatedCookieValue = updateJSON(uiStateCookie.raw === undefined ? '{}' : uiStateCookie.raw, dotPath, value);
    const currentDate = new Date();
    const expiryDate = addHours(currentDate, 3);
    const maxAgeInSeconds = differenceInSeconds(expiryDate, currentDate);
    const maxAgeInMilliseconds = maxAgeInSeconds * 1000;
    cookies.set(options.cookieName, updatedCookieValue, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      domain: options.cookieDomain,
      path: '/',
      maxAge: maxAgeInMilliseconds,
    });
  }

  context.serverResponse.uiStateCookie = {
    clear: clearUIStateCookie,
    set: setUIStateCookie,
  };
}
