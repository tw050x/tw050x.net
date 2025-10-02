import { Parameter, isParameter, readParameter } from "@tw050x.net.library/configuration";
import { logger } from "@tw050x.net.library/logger";
import { isSecret, readSecret, Secret } from "@tw050x.net.library/secret";
import { Middleware, ServiceContext } from "@tw050x.net.library/service";
import { default as Cookies } from "cookies";
import { verify } from "jsonwebtoken";

/**
 *
 */
export type AccessTokenCookie =
| {
  authorised: null;
  errors: Array<Error>;
  payload?: {
    sub?: string;
    uid?: string;
  }
  raw?: string;
}
| {
  authorised: boolean;
  errors: Array<Error>;
  payload: {
    sub: string;
    uid?: string;
  }
  raw?: string;
}

/**
 *
 */
export type UseAccessTokenCookieReaderOptions = {
  cookieName: string | Parameter;
  jwtSecretKey: Secret;
  requiredPermissions?: Array<string>;
}

/**
 *
 */
export type UseAccessTokenCookieReaderResultingContext = ServiceContext & {
  incomingMessage: ServiceContext['incomingMessage'] & {
    accessTokenCookie: AccessTokenCookie;
  }
}

/**
 *
 */
type Factory = (options: UseAccessTokenCookieReaderOptions) => Middleware<
  ServiceContext,
  UseAccessTokenCookieReaderResultingContext
>;

/**
 * @returns void
 */
export const useAccessTokenCookieReader: Factory = (options) => async (context) => {

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

  // retrieve the jwt swcret key
  let jwtSecretKey;
  if (isSecret(options.jwtSecretKey) === false) {
    logger.error('jwt secret key is not a secret');
    context.serverResponse.statusCode = 500;
    return void context.serverResponse.end();
  }
  try {
    jwtSecretKey = await readSecret(options.jwtSecretKey.key);
  }
  catch (error) {
    logger.error(error);
    context.serverResponse.statusCode = 500;
    return void context.serverResponse.end();
  }
  if (jwtSecretKey === undefined || jwtSecretKey === '') {
    logger.error('jwt secret key is undefined or empty');
    context.serverResponse.statusCode = 500;
    return void context.serverResponse.end();
  }

  // retrieve the required permissions
  let requiredPermissions: Array<string>;
  if (Array.isArray(options.requiredPermissions) === false) {
    requiredPermissions = [];
  }
  else requiredPermissions = options.requiredPermissions;

  // read the cookie
  const cookies = new Cookies(context.incomingMessage, context.serverResponse, {
    secure: true,
  });
  const cookie = cookies.get(cookieName);

  // Developer Note:
  // We use an explicit type assertion here because the use of `authorised: null` as an initial parameter
  // causes the type to narrow immediately and stops us being able to re-assign to another value later.
  const accessTokenCookie: AccessTokenCookie = {
    authorised: null,
    errors: [] as Array<Error>,
    raw: cookie,
  } as AccessTokenCookie;

  verifyCookieGuard: {
    if (cookie === undefined) {
      break verifyCookieGuard;
    }

    // verify the cookie
    let accessTokenPayload;
    try {
      accessTokenPayload = verify(cookie, jwtSecretKey);
    }
    catch (error) {
      logger.error(error);
      accessTokenCookie.errors.push(new Error('unable to verify access token cookie'))
      break verifyCookieGuard;
    }

    // ensure payload is an object
    if (typeof accessTokenPayload === 'string') {
      logger.error('access token payload is a string');
      accessTokenCookie.errors.push(new Error('access token payload is not an object'));
      break verifyCookieGuard;
    }

    // ensure payload has a "sub" property
    const sub = accessTokenPayload.sub;
    if (typeof sub !== 'string') {
      logger.error('access token payload sub is not a string');
      accessTokenCookie.errors.push(new Error('access token payload sub is not a string'));
      break verifyCookieGuard;
    }

    // if no required permissions, user is authorised
    //
    // TODO: check for user permissions in the databases
    let permissions: Array<string> = [];
    try {
      // permissions = await
    }
    catch (error) {
      logger.error(error);
      accessTokenCookie.errors.push(new Error('unable to fetch user permissions from database'));
      break verifyCookieGuard;
    }
    let hasAllPermissions = true;
    for (const requiredPermission of requiredPermissions) {
      // if (rol.includes(requiredPermission) === true) continue;
      // else hasAllPermissions = false;
    }
    if (hasAllPermissions === true) accessTokenCookie.authorised = true;
    else accessTokenCookie.authorised = false;
    accessTokenCookie.payload = {
      sub,
    }
  }
  context.incomingMessage.accessTokenCookie = accessTokenCookie
}
