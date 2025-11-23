import { read as readConfig } from "@tw050x.net.library/configs";
import { logger } from "@tw050x.net.library/logger";
import { read as readSecret } from "@tw050x.net.library/secrets";
import { Middleware, ServiceRequestContext } from "@tw050x.net.library/service";
import { createCipheriv, createDecipheriv, randomBytes } from 'node:crypto';
import { default as Cookies } from "cookies";

const loginStateCookieName = 'user.auth-state.login';
const stateCipherAlgorithm = 'aes-256-cbc';

/**
 * The payload stored in the login state cookie.
 */
export type LoginStateCookiePayload = {
  returnUrl?: URL;
}


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
type Factory = () => Middleware<
  ServiceRequestContext,
  UseLoginStateCookieResultingContext
>

/**
 * @returns void
 */
export const useLoginStateCookie: Factory = () => async (context) => {
  const cookieDomain = readConfig('cookie.*.domain');
  const encrypterSecretKey = readSecret('encrypter.secret-key');

  // read the cookie
  const cookies = new Cookies(context.incomingMessage, context.serverResponse, {
    secure: true,
  });
  const cookie = cookies.get(loginStateCookieName)

  // parse the cookie
  let loginStateCookiePayload: LoginStateCookiePayload | undefined
  payloadGuard: {
    if (cookie === undefined) {
      break payloadGuard;
    }
    try {
      const parsedCookie = JSON.parse(cookie);
      const decipher = createDecipheriv(stateCipherAlgorithm, Buffer.from(encrypterSecretKey, 'hex'), Buffer.from(parsedCookie.iv, 'hex'));
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
    })
    cookies.set(loginStateCookieName, value, {
      domain: cookieDomain,
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
