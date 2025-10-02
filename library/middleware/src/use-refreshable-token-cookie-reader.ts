import { Parameter, isParameter, readParameter } from "@tw050x.net.library/configuration";
import { logger } from "@tw050x.net.library/logger";
import { Middleware, ServiceContext } from "@tw050x.net.library/service";
import { default as Cookies } from "cookies";

/**
 *
 */
type RefreshableTokenCookie = {
  raw?: string;
}

/**
 *
 */
export type UseRefreshableTokenCookieReaderOptions = {
  cookieName: string | Parameter;
}

/**
 *
 */
export type UseRefreshableTokenCookieReaderOptionsResultingContext = ServiceContext & {
  incomingMessage: ServiceContext['incomingMessage'] & {
    refreshableTokenCookie: RefreshableTokenCookie;
  }
}

/**
 *
 */
type Factory = (options: UseRefreshableTokenCookieReaderOptions) => Middleware<
  ServiceContext,
  UseRefreshableTokenCookieReaderOptionsResultingContext
>;

/**
 * @returns void
 */
export const useRefreshableTokenCookieReader: Factory = (options) => async (context) => {

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
  const refreshableTokenCookie: RefreshableTokenCookie = {
    raw: cookie,
  }
  context.incomingMessage.refreshableTokenCookie = refreshableTokenCookie
}
