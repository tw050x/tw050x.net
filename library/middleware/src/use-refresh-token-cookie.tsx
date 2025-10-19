import { Parameter, isParameter, readParameter } from "@tw050x.net.library/configuration";
import { logger } from "@tw050x.net.library/logger";
import { Secret, isSecret, readSecret } from "@tw050x.net.library/secret";
import { Middleware, ServiceRequestContext } from "@tw050x.net.library/service";
import { default as Unrecoverable } from "@tw050x.net.library/uikit/document/Unrecoverable";
import { default as Cookies } from "cookies";
import { addDays, differenceInSeconds } from "date-fns";
import { verify } from "jsonwebtoken";

type RefreshTokenCookie = {
  errors: Array<Error>;
  payload?: {
    sub: string;
  }
  raw?: string;
}

export type UseRefreshTokenCookieOptions = {
  cookieName: string | Parameter;
  cookieDomain: string | Parameter;
  jwtSecretKey: string | Secret;
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
      return void context.serverResponse.sendInternalServerErrorHTMLResponse(<Unrecoverable />);
    }
    if (cookieName === '') {
      logger.error('access token cookie name is undefined or empty');
      return void context.serverResponse.sendInternalServerErrorHTMLResponse(<Unrecoverable />);
    }
  }

  //
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
      return void context.serverResponse.sendInternalServerErrorHTMLResponse(<Unrecoverable />);
    }
    if (cookieDomain === '') {
      logger.error('access token cookie name is undefined or empty');
      return void context.serverResponse.sendInternalServerErrorHTMLResponse(<Unrecoverable />);
    }
  }

  // retrieve the JWT secret key
  let jwtSecretKey;
  jwtSecretKeyGuard: {
    if (isSecret(options.jwtSecretKey) === false) {
      jwtSecretKey = options.jwtSecretKey;
      break jwtSecretKeyGuard;
    }
    try {
      jwtSecretKey = await readSecret(options.jwtSecretKey.key);
    }
    catch (error) {
      logger.error(error);
      return void context.serverResponse.sendInternalServerErrorHTMLResponse(<Unrecoverable />);
    }
    if (jwtSecretKey === '') {
      logger.error(new Error('encrypter secret key is undefined or empty'));
      return void context.serverResponse.sendInternalServerErrorHTMLResponse(<Unrecoverable />);
    }
  }

  const cookies = new Cookies(context.incomingMessage, context.serverResponse, {
    secure: true,
  });
  const cookie = cookies.get(cookieName);

  let refreshTokenCookieErrors: Array<Error> = [];
  let refreshTokenCookieRaw: string | undefined = cookie;
  let refreshTokenCookiePayload: RefreshTokenCookie['payload'] | undefined = undefined;
  verifyCookieGuard: {
    if (cookie === undefined) {
      break verifyCookieGuard;
    }
    let refreshTokenPayload;
    try {
      refreshTokenPayload = verify(cookie, jwtSecretKey);
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
  context.incomingMessage.refreshTokenCookie = {
    errors: refreshTokenCookieErrors,
    payload: refreshTokenCookiePayload,
    raw: refreshTokenCookieRaw,
  };

  //
  const clearRefreshTokenCookie = () => {
    cookies.set(cookieName, '', {
      domain: cookieDomain,
      httpOnly: true,
      path: '/token/refresh',
      sameSite: 'strict',
      secure: true,
    });
  }

  //
  const setRefreshTokenCookie = (value: string) => {
    const currentDate = new Date();
    const expiryDate = addDays(currentDate, 7);
    const maxAgeInSeconds = differenceInSeconds(expiryDate, currentDate);
    const maxAgeInMilliseconds = maxAgeInSeconds * 1000;
    cookies.set(cookieName, value, {
      domain: cookieDomain,
      httpOnly: true,
      maxAge: maxAgeInMilliseconds,
      path: '/token/refresh',
      sameSite: 'strict',
      secure: true,
    });
  }

  // initialize the cookies object on the incoming message
  context.serverResponse.refreshTokenCookie = {
    clear: clearRefreshTokenCookie,
    set: setRefreshTokenCookie
  };
}
