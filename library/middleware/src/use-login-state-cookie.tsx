import { Parameter, isParameter, readParameter } from "@tw050x.net.library/configuration";
import { logger } from "@tw050x.net.library/logger";
import { Secret, isSecret, readSecret } from "@tw050x.net.library/secret";
import { Middleware, ServiceRequestContext } from "@tw050x.net.library/service";
import { default as Unrecoverable } from "@tw050x.net.library/uikit/document/Unrecoverable";
import { createCipheriv, createDecipheriv, randomBytes } from 'node:crypto';
import { default as Cookies } from "cookies";

/**
 *
 */
export type LoginStateCookiePayload = {
  returnUrl?: URL;
}

/**
 *
 */
export type UseLoginStateCookieOptions = {
  cookieName: string | Parameter;
  cookieDomain: string | Parameter;
  encrypterSecretKey: string | Secret;
  stateCipherAlgorithm?: string | Parameter;
}

/**
 *
 */
const defaultStateCipherAlgorithm = 'aes-256-cbc';

/**
 *
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
  }
  if (cookieName === '') {
    logger.error(new Error('access token cookie name is undefined or empty'));
    return void context.serverResponse.sendInternalServerErrorHTMLResponse(<Unrecoverable />);
  }
  logger.debug(`Login state cookie name: ${cookieName}`);

  // retrieve the cookie domain
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
  }
  if (cookieDomain === '') {
    logger.error(new Error('access token cookie name is undefined or empty'));
    return void context.serverResponse.sendInternalServerErrorHTMLResponse(<Unrecoverable />);
  }
  logger.debug(`Login state cookie domain: ${cookieDomain}`);

  let encrypterSecretKey;
  encrypterSecretKeyGuard: {
    if (isSecret(options.encrypterSecretKey) === false) {
      encrypterSecretKey = options.encrypterSecretKey;
      break encrypterSecretKeyGuard;
    }
    try {
      encrypterSecretKey = await readSecret(options.encrypterSecretKey.key);
    }
    catch (error) {
      logger.error(error);
      return void context.serverResponse.sendInternalServerErrorHTMLResponse(<Unrecoverable />);
    }
  }
  if (encrypterSecretKey === '') {
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
    if (isParameter(options.stateCipherAlgorithm) === false) {
      stateCipherAlgorithm = options.stateCipherAlgorithm;
      break stateCipherAlgorithmGuard;
    }
    try {
      stateCipherAlgorithm = await readParameter(options.stateCipherAlgorithm.key);
    }
    catch (error) {
      logger.error(error);
      return void context.serverResponse.sendInternalServerErrorHTMLResponse(<Unrecoverable />);
    }
  }
  if (stateCipherAlgorithm === '') {
    logger.error(new Error('access token cookie name is undefined or empty'));
    return void context.serverResponse.sendInternalServerErrorHTMLResponse(<Unrecoverable />);
  }
  logger.debug(`State cipher algorithm: ${stateCipherAlgorithm}`);

  // read the cookie
  const cookies = new Cookies(context.incomingMessage, context.serverResponse, {
    secure: true,
  });
  const cookie = cookies.get(cookieName)

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
    cookies.set(cookieName, '', {
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
    cookies.set(cookieName, value, {
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
