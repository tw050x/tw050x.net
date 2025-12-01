import { read as readConfig } from "@tw050x.net.library/platform/helper/configs";
import { Middleware } from "@tw050x.net.library/platform/middleware";
import { ServiceRequestContext } from "@tw050x.net.library/platform/types";
import { updateJSON } from "@tw050x.net.library/platform/utility/update-json";
import { default as Cookies } from "cookies";
import { addHours, differenceInSeconds } from "date-fns";

const cookieName = 'ui.state.portal';

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
type Factory = () => Middleware<
  ServiceRequestContext,
  UseUIStateCookieResultingContext
>

/**
 * @returns void
 */
export const useUIStateCookie: Factory = () => async (context) => {
  const cookieDomain = readConfig("cookie.*.domain");

  // read the cookie
  const cookies = new Cookies(context.incomingMessage, context.serverResponse, {
    secure: true,
  });
  const cookie = cookies.get(cookieName);

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
    cookies.set(cookieName, '', {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      domain: cookieDomain,
      path: '/',
    });
  }

  const setUIStateCookie = (dotPath: string, value: unknown) => {
    const updatedCookieValue = updateJSON(uiStateCookie.raw === undefined ? '{}' : uiStateCookie.raw, dotPath, value);
    const currentDate = new Date();
    const expiryDate = addHours(currentDate, 3);
    const maxAgeInSeconds = differenceInSeconds(expiryDate, currentDate);
    const maxAgeInMilliseconds = maxAgeInSeconds * 1000;
    cookies.set(cookieName, updatedCookieValue, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      domain: cookieDomain,
      path: '/',
      maxAge: maxAgeInMilliseconds,
    });
  }

  context.serverResponse.uiStateCookie = {
    clear: clearUIStateCookie,
    set: setUIStateCookie,
  };
}
