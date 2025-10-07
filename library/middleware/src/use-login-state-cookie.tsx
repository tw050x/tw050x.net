import { Parameter, isParameter, readParameter } from "@tw050x.net.library/configuration";
import { logger } from "@tw050x.net.library/logger";
import { Secret, isSecret, readSecret } from "@tw050x.net.library/secret";
import { Middleware, ServiceRequestContext } from "@tw050x.net.library/service";
import { sendInternalServerErrorHTMLResponse } from "@tw050x.net.library/service/helper/response/send-internal-server-error-html-response";
import { default as Unrecoverable } from "@tw050x.net.library/uikit/document/Unrecoverable";
import { isAllowedDomain } from "@tw050x.net.library/utility/is-allowed-domain";
import { createCipheriv, createDecipheriv, randomBytes } from 'node:crypto';
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
export type UseLoginStateCookieOptions = {
  allowedReturnUrlDomains: string | Parameter;
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
      payload: LoginStateCookiePayload | undefined;
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
      return void sendInternalServerErrorHTMLResponse(context, await <Unrecoverable />);
    }
  }
  if (allowedReturnUrlDomains === '') {
    logger.error(new Error('access token cookie name is undefined or empty'));
    return void sendInternalServerErrorHTMLResponse(context, await <Unrecoverable />);
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
      return void sendInternalServerErrorHTMLResponse(context, await <Unrecoverable />);
    }
  }
  if (cookieName === '') {
    logger.error(new Error('access token cookie name is undefined or empty'));
    return void sendInternalServerErrorHTMLResponse(context, await <Unrecoverable />);
  }

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
      return void sendInternalServerErrorHTMLResponse(context, await <Unrecoverable />);
    }
  }
  if (cookieDomain === '') {
    logger.error(new Error('access token cookie name is undefined or empty'));
    return void sendInternalServerErrorHTMLResponse(context, await <Unrecoverable />);
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
      return void sendInternalServerErrorHTMLResponse(context, await <Unrecoverable />);
    }
  }
  if (encrypterSecretKey === '') {
    logger.error(new Error('encrypter secret key is undefined or empty'));
    return void sendInternalServerErrorHTMLResponse(context, await <Unrecoverable />);
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
      return void sendInternalServerErrorHTMLResponse(context, await <Unrecoverable />);
    }
  }
  if (stateCipherAlgorithm === '') {
    logger.error(new Error('access token cookie name is undefined or empty'));
    return void sendInternalServerErrorHTMLResponse(context, await <Unrecoverable />);
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
}
