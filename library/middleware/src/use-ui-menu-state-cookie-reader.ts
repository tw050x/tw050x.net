import { Parameter, isParameter, readParameter } from "@tw050x.net.library/configuration";
import { logger } from "@tw050x.net.library/logger";
import { Middleware, ServiceContext } from "@tw050x.net.library/service";
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
export type UseUIMenuStateCookieReaderOptions = {
  cookieName: string | Parameter;
}

/**
 *
 */
export type UseUIMenuStateCookieResultingContext = ServiceContext & {
  incomingMessage: ServiceContext['incomingMessage'] & {
    uiMenuStateCookie: UIMenuStateCookie;
  }
}

/**
 *
 */
type Factory = (options: UseUIMenuStateCookieReaderOptions) => Middleware<
  ServiceContext,
  UseUIMenuStateCookieResultingContext
>

/**
 * @returns void
 */
export const useUIMenuStateCookieReader: Factory = (options) => async (context) => {

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

  //
  const cookies = new Cookies(context.incomingMessage, context.serverResponse, {
    secure: true,
  });
  const cookie = cookies.get(cookieName);

  //
  const refreshableTokenCookie: UIMenuStateCookie = {
    raw: cookie,
    state: 'collapsed',
  }
  if (cookie === 'open') {
    refreshableTokenCookie.state = 'open';
  }
  context.incomingMessage.uiMenuStateCookie = refreshableTokenCookie
}
