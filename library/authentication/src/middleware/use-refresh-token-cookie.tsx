import { logger } from "@tw050x.net.library/logger";
import { Middleware, ServiceRequestContext } from "@tw050x.net.library/service";
import { default as Unrecoverable } from "@tw050x.net.library/uikit/document/Unrecoverable";
import { default as Cookies } from "cookies";
import { addDays, differenceInSeconds } from "date-fns";
import { default as jwt } from "jsonwebtoken";

type RefreshTokenCookie = {
  errors: Array<Error>;
  payload?: {
    sub: string;
  }
  refreshable: boolean;
  raw?: string;
}

export type UseRefreshTokenCookieOptions = {
  cookieDomain: string;
  jwtSecretKey: string;
  refreshCookieName: string;
  refreshableCookieName: string;
}

/**
 *
 */
export type UseRefreshTokenCookieResultingContext = ServiceRequestContext & {
  incomingMessage: ServiceRequestContext['incomingMessage'] & {
    refreshTokenCookie: RefreshTokenCookie;
  }
  serverResponse: ServiceRequestContext['serverResponse'] & {
    refreshTokenCookie: {
      clear: () => void;
      set: (value: string) => void;
    }
  }
}

/**
 *
 */
type Factory = (options: UseRefreshTokenCookieOptions) => Middleware<
  ServiceRequestContext,
  UseRefreshTokenCookieResultingContext
>

/**
 * @returns void
 */
export const useRefreshTokenCookie: Factory = (options) => async (context) => {

  // retrieve the cookie name
  cookieNameGuard: {
    if (options.refreshCookieName !== '') {
      break cookieNameGuard;
    }
    logger.error('access token cookie name is undefined or empty');
    return void context.serverResponse.sendInternalServerErrorHTMLResponse(<Unrecoverable />);
  }

  cookieNameGuard: {
    if (options.refreshableCookieName !== '') {
      break cookieNameGuard;
    }
    logger.error('access token cookie name is undefined or empty');
    return void context.serverResponse.sendInternalServerErrorHTMLResponse(<Unrecoverable />);
  }

  //
  cookieDomainGuard: {
    if (options.cookieDomain !== '') {
      break cookieDomainGuard;
    }
    logger.error('access token cookie name is undefined or empty');
    return void context.serverResponse.sendInternalServerErrorHTMLResponse(<Unrecoverable />);
  }

  // retrieve the JWT secret key
  jwtSecretKeyGuard: {
    if (options.jwtSecretKey !== '') {
      break jwtSecretKeyGuard;
    }
    logger.error(new Error('encrypter secret key is undefined or empty'));
    return void context.serverResponse.sendInternalServerErrorHTMLResponse(<Unrecoverable />);
  }

  const cookies = new Cookies(context.incomingMessage, context.serverResponse, {
    secure: true,
  });
  const refreshTokenCookie = cookies.get(options.refreshCookieName);
  const refreshTokenRefreshableCookie = cookies.get(options.refreshableCookieName);

  let refreshTokenCookieErrors: Array<Error> = [];
  let refreshTokenCookieRaw: string | undefined = refreshTokenCookie;
  let refreshTokenCookiePayload: RefreshTokenCookie['payload'] | undefined = undefined;
  verifyCookieGuard: {
    if (refreshTokenCookie === undefined) {
      break verifyCookieGuard;
    }
    let refreshTokenPayload;
    try {
      refreshTokenPayload = jwt.verify(refreshTokenCookie, options.jwtSecretKey);
    }
    catch (error) {
      logger.error(error);
      refreshTokenCookieErrors.push(new Error('unable to verify refresh token cookie'));
      break verifyCookieGuard;
    }
    if (typeof refreshTokenPayload === 'string') {
      logger.error('refresh token payload is a string');
      refreshTokenCookieErrors.push(new Error('refresh token payload is not an object'));
      break verifyCookieGuard;
    }
    const sub = refreshTokenPayload.sub;
    if (typeof sub !== 'string') {
      logger.error('refresh token payload sub is not a string');
      refreshTokenCookieErrors.push(new Error('refresh token payload sub is not a string'));
      break verifyCookieGuard;
    }
    refreshTokenCookiePayload = {
      sub,
    };
  }

  // initialize the cookies object on the incoming message
  context.incomingMessage.refreshTokenCookie = {
    errors: refreshTokenCookieErrors,
    payload: refreshTokenCookiePayload,
    refreshable: refreshTokenRefreshableCookie === 'true',
    raw: refreshTokenCookieRaw,
  };

  //
  const clearRefreshTokenCookie = () => {
    cookies.set(options.refreshCookieName, '', {
      domain: options.cookieDomain,
      httpOnly: true,
      path: '/token/refresh',
      sameSite: 'strict',
      secure: true,
    });
    cookies.set(options.refreshableCookieName, '', {
      domain: options.cookieDomain,
      httpOnly: false,
      path: '/',
      sameSite: 'lax',
      secure: true,
    });
  }

  //
  const setRefreshTokenCookie = (value: string) => {
    const currentDate = new Date();
    const expiryDate = addDays(currentDate, 7);
    const maxAgeInSeconds = differenceInSeconds(expiryDate, currentDate);
    const maxAgeInMilliseconds = maxAgeInSeconds * 1000;
    cookies.set(options.refreshCookieName, value, {
      domain: options.cookieDomain,
      httpOnly: true,
      maxAge: maxAgeInMilliseconds,
      path: '/token/refresh',
      sameSite: 'strict',
      secure: true,
    });
    cookies.set(options.refreshableCookieName, 'true', {
      domain: options.cookieDomain,
      httpOnly: false,
      maxAge: maxAgeInMilliseconds,
      path: '/',
      sameSite: 'lax',
      secure: true,
    });
  }

  // initialize the cookies object on the incoming message
  context.serverResponse.refreshTokenCookie = {
    clear: clearRefreshTokenCookie,
    set: setRefreshTokenCookie
  };
}
