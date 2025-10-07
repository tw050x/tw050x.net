import { Parameter, isParameter, readParameter } from "@tw050x.net.library/configuration";
import { logger } from "@tw050x.net.library/logger";
import { Middleware, ServiceRequestContext } from "@tw050x.net.library/service";
import { sendInternalServerErrorHTMLResponse } from "@tw050x.net.library/service/helper";
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
  cookieName: string | Parameter;
  cookieDomain: string | Parameter;
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
  let cookieName;
  cookieNameGuard: {
    if (isParameter(options.cookieName) === false) {
      cookieName = options.cookieName;
      break cookieNameGuard;
    }
    try {
      cookieName = await readParameter(options.cookieName.key);
    }
    catch (error) {
      logger.error(error);
      return void sendInternalServerErrorHTMLResponse(context, await <Unrecoverable />);
    }
    if (cookieName === '') {
      logger.error(new Error('access token cookie name is undefined or empty'));
      return void sendInternalServerErrorHTMLResponse(context, await <Unrecoverable />);
    }
  }

  // retrieve the cookie name
  let cookieDomain;
  cookieDomainGuard: {
    if (isParameter(options.cookieDomain) === false) {
      cookieDomain = options.cookieDomain;
      break cookieDomainGuard;
    }
    try {
      cookieDomain = await readParameter(options.cookieDomain.key);
    }
    catch (error) {
      logger.error(error);
      return void sendInternalServerErrorHTMLResponse(context, await <Unrecoverable />);
    }
    if (cookieDomain === '') {
      logger.error(new Error('access token cookie name is undefined or empty'));
      return void sendInternalServerErrorHTMLResponse(context, await <Unrecoverable />);
    }
  }

  //
  const cookies = new Cookies(context.incomingMessage, context.serverResponse, {
    secure: true,
  });
  const cookie = cookies.get(cookieName);

  // extend the cookie expiration by 30 days if it exists
  context.incomingMessage.uiUserTableToolsStateCookie = {
    raw: cookie,
    state: cookie === 'open' ? 'open' : 'collapsed',
  }

  //
  const clearUIUserTableToolsStateCookie = () => {
    cookies.set(cookieName, '', {
      domain: cookieDomain,
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
    cookies.set(cookieName, value, {
      domain: cookieDomain,
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
