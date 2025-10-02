import { Parameter, isParameter, readParameter } from "@tw050x.net.library/configuration";
import { logger } from "@tw050x.net.library/logger";
import { Secret, isSecret, readSecret } from "@tw050x.net.library/secret";
import { Middleware, ServiceContext } from "@tw050x.net.library/service";
import { default as Cookies } from "cookies";
import { verify } from "jsonwebtoken";

type RefreshTokenCookie = {
  errors: Array<Error>;
  payload?: {
    sub: string;
  }
  raw?: string;
}

export type UseRefreshTokenCookieReaderOptions = {
  cookieName: string | Parameter;
  jwtSecretKey: string | Secret;
}

/**
 *
 */
export type UseRefreshTokenCookieReaderResultingContext = ServiceContext & {
  incomingMessage: ServiceContext['incomingMessage'] & {
    refreshTokenCookie: RefreshTokenCookie;
  }
}

/**
 *
 */
type Factory = (options: UseRefreshTokenCookieReaderOptions) => Middleware<
  ServiceContext,
  UseRefreshTokenCookieReaderResultingContext
>

/**
 * @returns void
 */
export const useRefreshTokenCookieReader: Factory = (options) => async (context) => {

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
      context.serverResponse.statusCode = 500;
      return void context.serverResponse.end();
    }
  }
  if (jwtSecretKey === undefined || jwtSecretKey === '') {
    logger.error('encrypter secret key is undefined or empty');
    context.serverResponse.statusCode = 500;
    return void context.serverResponse.end();
  }

  const cookies = new Cookies(context.incomingMessage, context.serverResponse, {
    secure: true,
  });
  const cookie = cookies.get(cookieName);

  const refreshTokenCookie: RefreshTokenCookie = {
    errors: [] as Array<Error>,
    raw: cookie,
  }
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
      refreshTokenCookie.errors.push(new Error('unable to verify refresh token cookie'));
      break verifyCookieGuard;
    }
    if (typeof refreshTokenPayload === 'string') {
      logger.error('refresh token payload is a string');
      refreshTokenCookie.errors.push(new Error('refresh token payload is not an object'));
      break verifyCookieGuard;
    }
    const sub = refreshTokenPayload.sub;
    if (typeof sub !== 'string') {
      logger.error('refresh token payload sub is not a string');
      refreshTokenCookie.errors.push(new Error('refresh token payload sub is not a string'));
      break verifyCookieGuard;
    }
    refreshTokenCookie.payload = {
      sub,
    };
  }
  context.incomingMessage.refreshTokenCookie = refreshTokenCookie;
}
