import { Parameter, isParameter, readParameter } from "@tw050x.net.library/configuration";
import { logger } from "@tw050x.net.library/logger";
import { Secret, isSecret, readSecret } from "@tw050x.net.library/secret";
import { Middleware, ServiceContext } from "@tw050x.net.library/service";
import { createCipheriv, randomBytes } from 'node:crypto';
import { default as Cookies } from "cookies";

export type UseLoginStateCookieWriterOptions = {
  cookieName: string | Parameter;
  cookieDomain: string | Parameter;
  encrypterSecretKey: string | Secret;
  stateCipherAlgorithm?: string | Parameter;
}

/**
 *
 */
export type UseLoginStateCookieWriterOptionsResultingContext = ServiceContext & {
  serverResponse: ServiceContext['serverResponse'] & {
    loginStateCookie: {
      clear: () => void;
      set: (value: string) => void;
    }
  }
}

/**
 *
 */
type Factory = (options: UseLoginStateCookieWriterOptions) => Middleware<
  ServiceContext,
  UseLoginStateCookieWriterOptionsResultingContext
>;

/**
 *
 */
const defaultStateCipherAlgorithm = 'aes-256-cbc';

/**
 * @returns void
 */
export const useLoginStateCookieWriter: Factory = (options) => async (context) => {

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
      context.serverResponse.statusCode = 500;
      return void context.serverResponse.end();
    }
  }
  if (cookieDomain === undefined || cookieDomain === '') {
    logger.error('access token cookie name is undefined or empty');
    context.serverResponse.statusCode = 500;
    return void context.serverResponse.end();
  }

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
      context.serverResponse.statusCode = 500;
      return void context.serverResponse.end();
    }
  }
  if (stateCipherAlgorithm === undefined || stateCipherAlgorithm === '') {
    logger.error('access token cookie name is undefined or empty');
    context.serverResponse.statusCode = 500;
    return void context.serverResponse.end();
  }

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
      context.serverResponse.statusCode = 500;
      return void context.serverResponse.end();
    }
  }
  if (encrypterSecretKey === undefined || encrypterSecretKey === '') {
    logger.error('encrypter secret key is undefined or empty');
    context.serverResponse.statusCode = 500;
    return void context.serverResponse.end();
  }

  const cookies = new Cookies(context.incomingMessage, context.serverResponse, {
    secure: true,
  });

  const clearLoginStateCookie = () => {
    cookies.set(cookieName, '', {
      domain: cookieDomain,
      httpOnly: false,
      path: '/',
      sameSite: 'strict',
      secure: true,
    });
  }
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
}
