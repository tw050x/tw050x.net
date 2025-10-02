import { Parameter, isParameter, readParameter } from "@tw050x.net.library/configuration";
import { logger } from "@tw050x.net.library/logger";
import { Secret, isSecret, readSecret } from "@tw050x.net.library/secret";
import { Middleware, ServiceContext } from "@tw050x.net.library/service";
import { isAllowedDomain } from "@tw050x.net.library/utility/is-allowed-domain";
import { createDecipheriv } from "node:crypto";
import { default as Cookies } from "cookies";

/**
 *
 */
type LoginStateCookiePayload = {
  returnUrl: URL;
}

/**
 *
 */
export type UseLoginStateCookieReaderOptions = {
  allowedReturnUrlDomains: string | Parameter;
  cookieName: string | Parameter;
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
export type UseLoginStateCookieReaderResultingContext = ServiceContext & {
  incomingMessage: ServiceContext['incomingMessage'] & {
    loginStateCookie: {
      payload: LoginStateCookiePayload | undefined;
    }
  }
}

/**
 *
 */
type Factory = (options: UseLoginStateCookieReaderOptions) => Middleware<
  ServiceContext,
  UseLoginStateCookieReaderResultingContext
>

/**
 * @returns void
 */
export const useLoginStateCookieReader: Factory = (options) => async (context) => {

  // retrieve the cookie name
  let allowedReturnUrlDomains;
  allowedReturnUrlDomainsGuard: {
    if (isParameter(options.allowedReturnUrlDomains) === false) {
      allowedReturnUrlDomains = options.allowedReturnUrlDomains;
      break allowedReturnUrlDomainsGuard;
    }
    try {
      allowedReturnUrlDomains = await readParameter(options.allowedReturnUrlDomains.key);
    }
    catch (error) {
      logger.error(error);
      context.serverResponse.statusCode = 500;
      return void context.serverResponse.end();
    }
  }
  if (allowedReturnUrlDomains === undefined || allowedReturnUrlDomains === '') {
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
    let loginState
    try {
      const parsedCookie = JSON.parse(cookie);
      const decipher = createDecipheriv(stateCipherAlgorithm, Buffer.from(encrypterSecretKey, 'hex'), Buffer.from(parsedCookie.iv, 'hex'));
      let decrypted = decipher.update(parsedCookie.content, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      loginState = JSON.parse(decrypted);
    }
    catch (error) {
      logger.error(error);
      break payloadGuard;
    }
    // ensure login state is an object with a returnUrl property
    if (loginState === undefined) {
      break payloadGuard;
    }
    if (loginState === null) {
      break payloadGuard;
    }
    if (typeof loginState !== 'object') {
      break payloadGuard;
    }
    if ('returnUrl' in loginState === false) {
      break payloadGuard;
    }
    // fetch the allowed return url domains from config
    const listOfAllowedReturnUrlDomains = allowedReturnUrlDomains.split(',').map((domain) => domain.trim())
    // ensure that the "allowed_return_url_domains" setting exists
    // return an error if it does not
    if (Array.isArray(listOfAllowedReturnUrlDomains) === false) {
      break payloadGuard;
    }
    // check the return url domain against the allowed return url domains
    // return an error if the return url domain is not allowed
    if (isAllowedDomain(loginState.returnUrl, listOfAllowedReturnUrlDomains) === false) {
      break payloadGuard;
    }
    if (typeof loginState.returnUrl !== 'string') {
      break payloadGuard;
    }
    loginStateCookiePayload = {
      returnUrl: new URL(loginState.returnUrl)
    }
  }
  // initialize the cookies object on the incoming message
  context.incomingMessage.loginStateCookie = {
    payload: loginStateCookiePayload
  }
}
