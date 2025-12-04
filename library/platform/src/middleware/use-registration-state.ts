import { createCipheriv, createDecipheriv, randomBytes } from 'node:crypto';
import { default as Cookies } from "cookies";
import { read as readConfig } from "../helper/configs.js";
import { logger } from "../helper/logger.js";
import { read as readSecret } from "../helper/secrets.js";
import { Middleware } from "../middleware.js";
import { ServiceRequestContext } from "../types.js";

const registrationStateCookieName = 'user.auth-state.registration';
const stateCipherAlgorithm = 'aes-256-cbc';

/**
 * The payload stored in the registration state cookie.
 */
export type RegistrationStatePayload = {
  returnUrl?: URL;
}


/**
 * The resulting context for the useRegistrationState middleware.
 */
export type UseRegistrationStateResultingContext = ServiceRequestContext & {
  incomingMessage: ServiceRequestContext['incomingMessage'] & {
    registrationState: {
      payload?: RegistrationStatePayload;
    }
  }
  serverResponse: ServiceRequestContext['serverResponse'] & {
    registrationState: {
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
  UseRegistrationStateResultingContext
>

/**
 * @returns void
 */
export const useRegistrationState: Factory = () => async (context) => {
  const cookieDomain = readConfig('cookie.*.domain');
  const encrypterSecretKey = readSecret('encryption.cipher.secret-key');

  // read the cookie
  const cookies = new Cookies(context.incomingMessage, context.serverResponse, {
    secure: true,
  });
  const cookie = cookies.get(registrationStateCookieName)

  // parse the cookie
  let registrationStateCookiePayload: RegistrationStatePayload | undefined
  payloadGuard: {
    if (cookie === undefined) {
      break payloadGuard;
    }
    try {
      const parsedCookie = JSON.parse(cookie);
      const decipher = createDecipheriv(stateCipherAlgorithm, Buffer.from(encrypterSecretKey, 'hex'), Buffer.from(parsedCookie.iv, 'hex'));
      let decrypted = decipher.update(parsedCookie.content, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      registrationStateCookiePayload = JSON.parse(decrypted);
    }
    catch (error) {
      logger.error(error);
      break payloadGuard;
    }
    // ensure registration state is an object with a returnUrl property
    if (registrationStateCookiePayload === undefined) {
      logger.debug('Registration state cookie payload is undefined');
      break payloadGuard;
    }
    if (registrationStateCookiePayload === null) {
      logger.debug('Registration state cookie payload is null');
      break payloadGuard;
    }
    if (typeof registrationStateCookiePayload !== 'object') {
      logger.debug('Registration state cookie payload is not an object');
      break payloadGuard;
    }
    if ('returnUrl' in registrationStateCookiePayload === false) {
      logger.debug('Registration state cookie payload does not have a returnUrl property');
      break payloadGuard;
    }
  }
  // initialize the cookies object on the incoming message
  context.incomingMessage.registrationState = {
    payload: registrationStateCookiePayload
  }

  // define the clear function
  const clearRegistrationStateCookie = () => {
    cookies.set(registrationStateCookieName, '', {
      domain: cookieDomain,
      httpOnly: false,
      path: '/',
      sameSite: 'strict',
      secure: true,
    });
  }

  // define the set function
  const setRegistrationStateCookie = (state: string) => {
    const iv = randomBytes(16);
    const cipher = createCipheriv(stateCipherAlgorithm, Buffer.from(encrypterSecretKey, 'hex'), iv);
    let encrypted = cipher.update(state, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    const value = JSON.stringify({
      iv: iv.toString('hex'),
      content: encrypted
    })
    cookies.set(registrationStateCookieName, value, {
      domain: cookieDomain,
      httpOnly: false,
      path: '/',
      sameSite: 'strict',
      secure: true,
    });
  }

  // initialize the cookies object on the incoming message
  context.serverResponse.registrationState = {
    clear: clearRegistrationStateCookie,
    set: setRegistrationStateCookie
  };
  logger.debug('Registration state cookie middleware initialized');
}
