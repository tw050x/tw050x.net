import { logger } from "@tw050x.net.library/logger";
import { Middleware, ServiceRequestContext } from "@tw050x.net.library/service";
import { default as Unrecoverable } from "@tw050x.net.library/uikit/document/Unrecoverable";
import { createCipheriv, createDecipheriv, randomBytes } from 'node:crypto';
import { default as Cookies } from "cookies";

/**
 * The payload stored in the login state cookie.
 */
export type LoginStateCookiePayload = {
  returnUrl?: URL;
}

/**
 * The options for the useLoginStateCookie middleware.
 */
export type UseLoginStateCookieOptions = {
  cookieName: string;
  cookieDomain: string;
  encrypterSecretKey: string;
  stateCipherAlgorithm?: string;
}

/**
 * The default state cipher algorithm to use.
 */
const defaultStateCipherAlgorithm = 'aes-256-cbc';

/**
 * The resulting context for the useLoginStateCookie middleware.
 */
export type UseLoginStateCookieResultingContext = ServiceRequestContext & {
  incomingMessage: ServiceRequestContext['incomingMessage'] & {
    loginStateCookie: {
      payload?: LoginStateCookiePayload;
    }
  }
  serverResponse: ServiceRequestContext['serverResponse'] & {
    loginStateCookie: {
      clear: () => void;
      set: (value: string) => void;
    }
  }
}

/**
 *
 */
type Factory = (options: UseLoginStateCookieOptions) => Middleware<
  ServiceRequestContext,
  UseLoginStateCookieResultingContext
>

/**
 * @returns void
 */
export const useLoginStateCookie: Factory = (options) => async (context) => {

  // check the cookie name
  cookieNameGuard: {
    if (options.cookieName !== '') {
      break cookieNameGuard;
    }
    logger.error(new Error('access token cookie name is undefined or empty'));
    return void context.serverResponse.sendInternalServerErrorHTMLResponse(<Unrecoverable />);
  }
  logger.debug(`Login state cookie name: ${options.cookieName}`);

  // check the cookie domain
  cookieDomainGuard: {
    if (options.cookieDomain !== '') {
      break cookieDomainGuard;
    }
    logger.error(new Error('access token cookie domain is undefined or empty'));
    return void context.serverResponse.sendInternalServerErrorHTMLResponse(<Unrecoverable />);
  }
  logger.debug(`Login state cookie domain: ${options.cookieDomain}`);

  // check the encrypter secret key
  encrypterSecretKeyGuard: {
    if (options.encrypterSecretKey !== '') {
      break encrypterSecretKeyGuard;
    }
    logger.error(new Error('encrypter secret key is undefined or empty'));
    return void context.serverResponse.sendInternalServerErrorHTMLResponse(<Unrecoverable />);
  }
  logger.debug('Encrypter secret key retrieved');

  // retrieve the cookie name
  let stateCipherAlgorithm;
  stateCipherAlgorithmGuard: {
    if (options.stateCipherAlgorithm === undefined) {
      stateCipherAlgorithm = defaultStateCipherAlgorithm;
      break stateCipherAlgorithmGuard;
    }
    if (options.stateCipherAlgorithm !== '') {
      stateCipherAlgorithm = options.stateCipherAlgorithm;
      break stateCipherAlgorithmGuard;
    }
    logger.error(new Error('access token cookie name is undefined or empty'));
    return void context.serverResponse.sendInternalServerErrorHTMLResponse(<Unrecoverable />);
  }
  logger.debug(`State cipher algorithm: ${stateCipherAlgorithm}`);

  // read the cookie
  const cookies = new Cookies(context.incomingMessage, context.serverResponse, {
    secure: true,
  });
  const cookie = cookies.get(options.cookieName)

  // parse the cookie
  let loginStateCookiePayload: LoginStateCookiePayload | undefined
  payloadGuard: {
    if (cookie === undefined) {
      break payloadGuard;
    }
    try {
      const parsedCookie = JSON.parse(cookie);
      const decipher = createDecipheriv(stateCipherAlgorithm, Buffer.from(options.encrypterSecretKey, 'hex'), Buffer.from(parsedCookie.iv, 'hex'));
      let decrypted = decipher.update(parsedCookie.content, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      loginStateCookiePayload = JSON.parse(decrypted);
    }
    catch (error) {
      logger.error(error);
      break payloadGuard;
    }
    // ensure login state is an object with a returnUrl property
    if (loginStateCookiePayload === undefined) {
      logger.debug('Login state cookie payload is undefined');
      break payloadGuard;
    }
    if (loginStateCookiePayload === null) {
      logger.debug('Login state cookie payload is null');
      break payloadGuard;
    }
    if (typeof loginStateCookiePayload !== 'object') {
      logger.debug('Login state cookie payload is not an object');
      break payloadGuard;
    }
    if ('returnUrl' in loginStateCookiePayload === false) {
      logger.debug('Login state cookie payload does not have a returnUrl property');
      break payloadGuard;
    }
  }
  // initialize the cookies object on the incoming message
  context.incomingMessage.loginStateCookie = {
    payload: loginStateCookiePayload
  }

  // define the clear function
  const clearLoginStateCookie = () => {
    cookies.set(options.cookieName, '', {
      domain: options.cookieDomain,
      httpOnly: false,
      path: '/',
      sameSite: 'strict',
      secure: true,
    });
  }

  // define the set function
  const setLoginStateCookie = (state: string) => {
    const iv = randomBytes(16);
    const cipher = createCipheriv(stateCipherAlgorithm, Buffer.from(options.encrypterSecretKey, 'hex'), iv);
    let encrypted = cipher.update(state, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    const value = JSON.stringify({
      iv: iv.toString('hex'),
      content: encrypted
    })
    cookies.set(options.cookieName, value, {
      domain: options.cookieDomain,
      httpOnly: false,
      path: '/',
      sameSite: 'strict',
      secure: true,
    });
  }

  // initialize the cookies object on the incoming message
  context.serverResponse.loginStateCookie = {
    clear: clearLoginStateCookie,
    set: setLoginStateCookie
  };
  logger.debug('Login state cookie middleware initialized');
}
