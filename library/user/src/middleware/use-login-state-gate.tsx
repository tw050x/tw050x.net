import { logger } from "@tw050x.net.library/logger";
import { Middleware, ServiceRequestContext } from "@tw050x.net.library/service";
import { default as BadRequest } from "@tw050x.net.library/uikit/document/BadRequest";
import { default as Unrecoverable } from "@tw050x.net.library/uikit/document/Unrecoverable";
import { isAllowedDomain } from "@tw050x.net.library/utility/is-allowed-domain";
import { UseLoginStateResultingContext } from "./use-login-state.js";

/**
 * Options for the login state gate middleware.
 */
export type UseLoginStateGateOptions = {
  allowedReturnUrlDomains: string;
}

/**
 * Resulting context after the login state gate middleware has run.
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
 * Middleware factory for the login state gate.
 */
type Factory = (options: UseLoginStateGateOptions) => Middleware<
  ServiceRequestContext & UseLoginStateResultingContext,
  LoginStateGateResultingContext
>

/**
 * Middleware that gates access based on the login state cookie.
 */
export const useLoginStateGate: Factory = (options) => async (context) => {

  // parse the allowed return URL domains
  const listOfAllowedDomains = options.allowedReturnUrlDomains.split(',').map((domain) => domain.trim()).filter((domain) => domain !== '');
  if (listOfAllowedDomains.length === 0) {
    logger.error(new Error('no allowed return URL domains are configured'));
    return void context.serverResponse.sendInternalServerErrorHTMLResponse(<Unrecoverable />);
  }
  logger.debug(`List of allowed return URL domains: ${listOfAllowedDomains.join(', ')}`);

  // If the login state cookie is not present, return an internal server error
  if (context.incomingMessage.loginState.cookie.payload === undefined) {
    logger.error(new Error('login state cookie payload is undefined'));
    return void context.serverResponse.sendBadRequestHTMLResponse(<BadRequest />);
  }
  logger.debug(`Login state cookie payload: ${JSON.stringify(context.incomingMessage.loginState.cookie.payload)}`);

  // If the login state cookie does not contain a return URL, return an internal server error
  if (context.incomingMessage.loginState.cookie.payload.returnUrl === undefined) {
    logger.error(new Error('login state cookie payload return URL is undefined'));
    return void context.serverResponse.sendBadRequestHTMLResponse(<BadRequest />);
  }
  logger.debug(`Login state cookie payload return URL: ${context.incomingMessage.loginState.cookie.payload.returnUrl.toString()}`);

  // If the login state cookie contains a return URL, check if it is allowed
  if (isAllowedDomain(context.incomingMessage.loginState.cookie.payload.returnUrl, listOfAllowedDomains) === false) {
    logger.error(new Error('login state cookie payload return URL is not allowed'));
    return void context.serverResponse.sendBadRequestHTMLResponse(<BadRequest />);
  }
  logger.debug('Login state cookie payload return URL is allowed');
}
