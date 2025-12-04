import { createCipheriv, createDecipheriv, randomBytes } from 'node:crypto';
import { default as Cookies } from "cookies";
import { read as readConfig } from "../helper/configs.js";
import { logger } from "../helper/logger.js";
import { read as readSecret } from "../helper/secrets.js";
import { Middleware } from "../middleware.js";
import { ServiceRequestContext } from "../types.js";

const loginStateCookieName = 'user.auth-state.login';
const stateCipherAlgorithm = 'aes-256-cbc';

/**
 * The payload stored in the login state cookie.
 */
export type LoginStatePayload = {
  returnUrl?: URL;
}

/**
 * The resulting context for the useLoginState middleware.
 */
export type UseLoginStateResultingContext = ServiceRequestContext & {
  incomingMessage: ServiceRequestContext['incomingMessage'] & {
    loginState: {
      cookie: {
        payload?: LoginStatePayload;
      }
    }
  }
  serverResponse: ServiceRequestContext['serverResponse'] & {
    loginState: {
      cookie: {
        clear: () => void;
        set: (value: string) => void;
      }
    }
  }
}

/**
 *
 */
type Factory = () => Middleware<
  ServiceRequestContext,
  UseLoginStateResultingContext
>

/**
 * @returns void
 */
export const useLoginState: Factory = () => async (context) => {
  const cookieDomain = readConfig('cookie.*.domain');
  const encrypterSecretKey = readSecret('encryption.cipher.secret-key');

  // read the cookie
  const cookies = new Cookies(context.incomingMessage, context.serverResponse, {
    secure: true,
  });
  const cookie = cookies.get(loginStateCookieName)

  // parse the cookie
  let loginStateCookiePayload: LoginStatePayload = {
    returnUrl: undefined
  };
  payloadGuard: {
    if (cookie === undefined) {
      break payloadGuard;
    }
    let parseLoginStateCookiePayload: unknown;
    try {
      const parsedCookie = JSON.parse(cookie);
      const decipher = createDecipheriv(stateCipherAlgorithm, Buffer.from(encrypterSecretKey, 'hex'), Buffer.from(parsedCookie.iv, 'hex'));
      let decrypted = decipher.update(parsedCookie.content, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      parseLoginStateCookiePayload = JSON.parse(decrypted);
    }
    catch (error) {
      logger.error(error);
      break payloadGuard;
    }
    // ensure login state is an object with a returnUrl property
    if (parseLoginStateCookiePayload === undefined) {
      logger.debug('Login state cookie payload is undefined');
      break payloadGuard;
    }
    if (parseLoginStateCookiePayload === null) {
      logger.debug('Login state cookie payload is null');
      break payloadGuard;
    }
    if (typeof parseLoginStateCookiePayload !== 'object') {
      logger.debug('Login state cookie payload is not an object');
      break payloadGuard;
    }
    if ('returnUrl' in parseLoginStateCookiePayload === false) {
      logger.debug('Login state cookie payload does not have a returnUrl property');
      break payloadGuard;
    }
    if (typeof parseLoginStateCookiePayload.returnUrl !== 'string') {
      logger.debug('Login state cookie payload returnUrl property is not a string');
      break payloadGuard;
    }

    // parse the returnUrl property as a URL
    let returnUrl: URL;
    try {
      returnUrl = new URL(parseLoginStateCookiePayload.returnUrl);
    }
    catch (error) {
      logger.error(error);
      break payloadGuard;
    }

    // assign the returnUrl to the login state cookie payload
    loginStateCookiePayload.returnUrl = returnUrl;
  }
  // initialize the cookies object on the incoming message
  context.incomingMessage.loginState = {
    cookie: {
      payload: loginStateCookiePayload
    }
  }

  // define the clear function
  const clearLoginStateCookie = () => {
    cookies.set(loginStateCookieName, '', {
      domain: cookieDomain,
      httpOnly: false,
      path: '/',
      sameSite: 'strict',
      secure: true,
    });
  }

  // define the set function
  const setLoginStateCookie = (state: string) => {
    const iv = randomBytes(16);
    const cipher = createCipheriv(stateCipherAlgorithm, Buffer.from(encrypterSecretKey, 'hex'), iv);
    let encrypted = cipher.update(state, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    const value = JSON.stringify({
      iv: iv.toString('hex'),
      content: encrypted
    });
    cookies.set(loginStateCookieName, value, {
      domain: cookieDomain,
      httpOnly: false,
      path: '/',
      sameSite: 'strict',
      secure: true,
    });
  }

  // initialize the cookies object on the incoming message
  context.serverResponse.loginState = {
    cookie: {
      clear: clearLoginStateCookie,
      set: setLoginStateCookie
    }
  };
  logger.debug('Login state cookie middleware initialized');
}
