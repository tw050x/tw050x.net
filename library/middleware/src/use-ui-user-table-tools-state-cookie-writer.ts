import { Parameter, isParameter, readParameter } from "@tw050x.net.library/configuration";
import { logger } from "@tw050x.net.library/logger";
import { Middleware, ServiceContext } from "@tw050x.net.library/service";
import { default as Cookies } from "cookies";
import { addDays, differenceInSeconds } from "date-fns";

/**
 *
 */
export type UseUIUserTableToolsStateCookieWriterOptions = {
  cookieName: string | Parameter;
  cookieDomain: string | Parameter;
}

/**
 *
 */
export type UseUIUserTableToolsStateCookieWriterOptionsResultingContext = ServiceContext & {
  serverResponse: ServiceContext['serverResponse'] & {
    uiUserTableToolsStateCookie: {
      clear: () => void;
      set: (value: string) => void;
    }
  }
}

/**
 *
 */
type Factory = (options: UseUIUserTableToolsStateCookieWriterOptions) => Middleware<
  ServiceContext,
  UseUIUserTableToolsStateCookieWriterOptionsResultingContext
>;

/**
 * @returns void
 */
export const useUIUserTableToolsStateCookieWriter: Factory = (options) => async (context) => {

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
      context.serverResponse.statusCode = 500;
      return void context.serverResponse.end();
    }
  }
  if (cookieName === undefined || cookieName === '') {
    logger.error('access token cookie name is undefined or empty');
    context.serverResponse.statusCode = 500;
    return void context.serverResponse.end();
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
      context.serverResponse.statusCode = 500;
      return void context.serverResponse.end();
    }
  }
  if (cookieDomain === undefined || cookieDomain === '') {
    logger.error('access token cookie name is undefined or empty');
    context.serverResponse.statusCode = 500;
    return void context.serverResponse.end();
  }

  //
  const cookies = new Cookies(context.incomingMessage, context.serverResponse, {
    secure: true,
  });

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
