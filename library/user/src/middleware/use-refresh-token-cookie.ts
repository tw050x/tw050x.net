import { read as readConfig } from "@tw050x.net.library/configs";
import { logger } from "@tw050x.net.library/logger";
import { read as readSecret } from "@tw050x.net.library/secrets";
import { Middleware, ServiceRequestContext } from "@tw050x.net.library/service";
import { default as Cookies } from "cookies";
import { addDays, differenceInSeconds } from "date-fns";
import { default as jwt } from "jsonwebtoken";

const refreshTokenCookieName = 'user-service.auth-token.refresh';
const refreshableTokenCookieName = 'user-service.auth-token.refreshable';

type RefreshTokenCookie = {
  errors: Array<Error>;
  payload?: {
    sub: string;
  }
  refreshable: boolean;
  raw?: string;
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
type Factory = () => Middleware<
  ServiceRequestContext,
  UseRefreshTokenCookieResultingContext
>

/**
 * Middleware to handle refresh token cookies.
 *
 * @returns void
 */
export const useRefreshTokenCookie: Factory = () => async (context) => {
  const cookieDomain = readConfig('cookie.*.domain');
  const jwtSecretKey = readSecret('jwt.secret-key');

  const cookies = new Cookies(context.incomingMessage, context.serverResponse, {
    secure: true,
  });
  const refreshTokenCookie = cookies.get(refreshTokenCookieName);
  const refreshTokenRefreshableCookie = cookies.get(refreshableTokenCookieName);

  let refreshTokenCookieErrors: Array<Error> = [];
  let refreshTokenCookieRaw: string | undefined = refreshTokenCookie;
  let refreshTokenCookiePayload: RefreshTokenCookie['payload'] | undefined = undefined;
  verifyCookieGuard: {
    if (refreshTokenCookie === undefined) {
      break verifyCookieGuard;
    }
    let refreshTokenPayload;
    try {
      refreshTokenPayload = jwt.verify(refreshTokenCookie, jwtSecretKey);
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
    cookies.set(refreshTokenCookieName, '', {
      domain: cookieDomain,
      httpOnly: true,
      path: '/token/refresh',
      sameSite: 'strict',
      secure: true,
    });
    cookies.set(refreshableTokenCookieName, '', {
      domain: cookieDomain,
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
    cookies.set(refreshTokenCookieName, value, {
      domain: cookieDomain,
      httpOnly: true,
      maxAge: maxAgeInMilliseconds,
      path: '/token/refresh',
      sameSite: 'strict',
      secure: true,
    });
    cookies.set(refreshableTokenCookieName, 'true', {
      domain: cookieDomain,
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
