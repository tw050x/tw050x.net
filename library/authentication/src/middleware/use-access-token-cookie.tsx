import { logger } from "@tw050x.net.library/logger";
import { Middleware, ServiceRequestContext } from "@tw050x.net.library/service";
import { default as Unrecoverable } from "@tw050x.net.library/uikit/document/Unrecoverable";
import { default as Cookies } from "cookies";
import { addHours, differenceInSeconds } from "date-fns";
import { default as jwt } from "jsonwebtoken";

/**
 * Access token cookie
 */
export type AccessTokenCookie = {
  authorised: boolean | null;
  errors: Array<Error>;
  payload?: {
    sub?: string;
    uid?: string;
  }
  raw?: string;
}

/**
 * Options for the useAccessTokenCookie middleware
 */
export type UseAccessTokenCookieOptions = {
  cookieName: string;
  cookieDomain: string;
  jwtSecretKey: string;
  requiredPermissions?: Array<string>;
}

/**
 * Resulting context after the useAccessTokenCookie middleware has run
 */
export type UseAccessTokenCookieResultingContext = ServiceRequestContext & {
  incomingMessage: ServiceRequestContext['incomingMessage'] & {
    accessTokenCookie: AccessTokenCookie;
  }
  serverResponse: ServiceRequestContext['serverResponse'] & {
    accessTokenCookie: {
      clear: () => void;
      set: (value: string) => void;
    };
  }
}

/**
 * Factory type for the useAccessTokenCookie middleware
 */
type Factory = (options: UseAccessTokenCookieOptions) => Middleware<
  ServiceRequestContext,
  UseAccessTokenCookieResultingContext
>;

/**
 * @returns void
 */
export const useAccessTokenCookie: Factory = (options) => async (context) => {

  // retrieve the cookie name
  cookieNameGuard: {
    if (options.cookieName !== '') {
      break cookieNameGuard;
    }
    logger.error(new Error('access token cookie name is empty'));
    return void context.serverResponse.sendInternalServerErrorHTMLResponse(<Unrecoverable />)
  }

  // retrieve the cookie domain
  cookieDomainGuard: {
    if (options.cookieDomain !== '') {
      break cookieDomainGuard;
    }
    logger.error(new Error('access token cookie domain is empty'));
    return void context.serverResponse.sendInternalServerErrorHTMLResponse(<Unrecoverable />)
  }

  // retrieve the jwt secret key
  if (options.jwtSecretKey === '') {
    logger.error(new Error('jwt secret key is empty'));
    return void context.serverResponse.sendInternalServerErrorHTMLResponse(<Unrecoverable />);
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
  const cookie = cookies.get(options.cookieName);

  let accessTokenCookieAuthorised: boolean | null = null;
  let accessTokenCookieErrors: Array<Error> = [];
  let accessTokenCookiePayload: AccessTokenCookie['payload']
  let accessTokenCookieRawValue: string | undefined = cookie;
  verifyCookieGuard: {
    if (cookie === undefined) {
      break verifyCookieGuard;
    }

    // verify the cookie
    let accessTokenPayload;
    try {
      accessTokenPayload = jwt.verify(cookie, options.jwtSecretKey);
    }
    catch (error) {
      logger.error(error);
      accessTokenCookieErrors = [new Error('unable to verify access token cookie')];
      break verifyCookieGuard;
    }

    // ensure payload is an object
    if (typeof accessTokenPayload === 'string') {
      logger.error('access token payload is a string');
      accessTokenCookieErrors = [new Error('access token payload is not an object')];
      break verifyCookieGuard;
    }

    // ensure payload has a "sub" property
    const sub = accessTokenPayload.sub;
    if (typeof sub !== 'string') {
      logger.error('access token payload sub is not a string');
      accessTokenCookieErrors = [new Error('access token payload sub is not a string')];
      break verifyCookieGuard;
    }

    // assign the local payload variable to the upper scope variable
    accessTokenCookiePayload = accessTokenPayload

    // if no required permissions, user is authorised
    // TODO: check for user permissions in the databases
    let permissions: Array<string> = [];
    try {
      // permissions = await
    }
    catch (error) {
      logger.error(error);
      accessTokenCookieErrors = [new Error('unable to fetch user permissions from database')];
      break verifyCookieGuard;
    }
    let hasAllPermissions = true;
    for (const requiredPermission of requiredPermissions) {
      // if (rol.includes(requiredPermission) === true) continue;
      // else hasAllPermissions = false;
    }
    if (hasAllPermissions === true) accessTokenCookieAuthorised = true;
    else accessTokenCookieAuthorised = false;
  }

  context.incomingMessage.accessTokenCookie = {
    authorised: accessTokenCookieAuthorised,
    errors: accessTokenCookieErrors,
    payload: accessTokenCookiePayload,
    raw: accessTokenCookieRawValue,
  }

  // define the clear function
  const clearAccessTokenCookie = () => {
    cookies.set(options.cookieName, '', {
      domain: options.cookieDomain,
      httpOnly: false,
      path: '/',
      sameSite: 'strict',
      secure: true,
    });
  }

  // define the set function
  const setAccessTokenCookie = (value: string) => {
    const currentDate = new Date();
    const expiryDate = addHours(currentDate, 3);
    const maxAgeInSeconds = differenceInSeconds(expiryDate, currentDate);
    const maxAgeInMilliseconds = maxAgeInSeconds * 1000;
    cookies.set(options.cookieName, value, {
      domain: options.cookieDomain,
      httpOnly: false,
      maxAge: maxAgeInMilliseconds,
      path: '/',
      sameSite: 'strict',
      secure: true,
    });
  }

  // initialize the cookies object on the incoming message
  context.serverResponse.accessTokenCookie = {
    clear: clearAccessTokenCookie,
    set: setAccessTokenCookie,
  };
}
