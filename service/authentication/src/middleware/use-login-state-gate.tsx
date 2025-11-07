import { UseLoginStateCookieResultingContext } from "@tw050x.net.library/authentication/middleware/use-login-state-cookie";
import { Parameter, isParameter, readParameter } from "@tw050x.net.library/configuration";
import { logger } from "@tw050x.net.library/logger";
import { Middleware, ServiceRequestContext } from "@tw050x.net.library/service";
import { default as BadRequest } from "@tw050x.net.library/uikit/document/BadRequest";
import { default as Unrecoverable } from "@tw050x.net.library/uikit/document/Unrecoverable";
import { isAllowedDomain } from "@tw050x.net.library/utility/is-allowed-domain";

/**
 *
 */
export type UseLoginStateGateOptions = {
  allowedReturnUrlDomains: string | Parameter;
}

/**
 *
 */
export type LoginStateGateResultingContext = ServiceRequestContext & {
  incomingMessage: ServiceRequestContext['incomingMessage'] & {
    loginStateCookie: {
      payload: {
        returnUrl: URL;
      }
    }
  }
}

/**
 *
 */
type Factory = (options: UseLoginStateGateOptions) => Middleware<
  ServiceRequestContext & UseLoginStateCookieResultingContext,
  LoginStateGateResultingContext
>

/**
 *
 */
export const useLoginStateGate: Factory = (options) => async (context) => {

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
      return void context.serverResponse.sendInternalServerErrorHTMLResponse(<Unrecoverable />);
    }
  }
  if (allowedReturnUrlDomains === '') {
    logger.error(new Error('access token cookie name is undefined or empty'));
    return void context.serverResponse.sendInternalServerErrorHTMLResponse(<Unrecoverable />);
  }
  logger.debug(`Allowed return URL domains: ${allowedReturnUrlDomains}`);

  // parse the allowed return URL domains
  const listOfAllowedDomains = allowedReturnUrlDomains.split(',').map((domain) => domain.trim()).filter((domain) => domain !== '');
  if (listOfAllowedDomains.length === 0) {
    logger.error(new Error('no allowed return URL domains are configured'));
    return void context.serverResponse.sendInternalServerErrorHTMLResponse(<Unrecoverable />);
  }
  logger.debug(`List of allowed return URL domains: ${listOfAllowedDomains.join(', ')}`);

  // If the login state cookie is not present, return an internal server error
  if (context.incomingMessage.loginStateCookie.payload === undefined) {
    logger.error(new Error('login state cookie payload is undefined'));
    return void context.serverResponse.sendBadRequestHTMLResponse(<BadRequest />);
  }
  logger.debug(`Login state cookie payload: ${JSON.stringify(context.incomingMessage.loginStateCookie.payload)}`);

  // If the login state cookie does not contain a return URL, return an internal server error
  if (context.incomingMessage.loginStateCookie.payload.returnUrl === undefined) {
    logger.error(new Error('login state cookie payload return URL is undefined'));
    return void context.serverResponse.sendBadRequestHTMLResponse(<BadRequest />);
  }
  logger.debug(`Login state cookie payload return URL: ${context.incomingMessage.loginStateCookie.payload.returnUrl.toString()}`);

  // If the login state cookie contains a return URL, check if it is allowed
  if (isAllowedDomain(context.incomingMessage.loginStateCookie.payload.returnUrl, listOfAllowedDomains) === false) {
    logger.error(new Error('login state cookie payload return URL is not allowed'));
    return void context.serverResponse.sendBadRequestHTMLResponse(<BadRequest />);
  }
  logger.debug('Login state cookie payload return URL is allowed');
}
