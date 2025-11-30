import { logger } from "@tw050x.net.library/logger";
import { Middleware, ServiceRequestContext } from "@tw050x.net.library/service";
import { default as BadRequest } from "@tw050x.net.library/uikit/document/BadRequest";
import { default as Unrecoverable } from "@tw050x.net.library/uikit/document/Unrecoverable";
import { isAllowedDomain } from "@tw050x.net.library/utility/is-allowed-domain";
import { UseRegistrationStateResultingContext } from "./use-registration-state.js";

/**
 * Options for the registration state gate middleware.
 */
export type UseRegistrationStateGateOptions = {
  allowedReturnUrlDomains: string;
}

/**
 * Resulting context after the registration state gate middleware has run.
 */
export type RegistrationStateGateResultingContext = ServiceRequestContext & {
  incomingMessage: ServiceRequestContext['incomingMessage'] & {
    registrationStateCookie: {
      payload: {
        returnUrl: URL;
      }
    }
  }
}

/**
 * Middleware factory for the registration state gate.
 */
type Factory = (options: UseRegistrationStateGateOptions) => Middleware<
  ServiceRequestContext & UseRegistrationStateResultingContext,
  RegistrationStateGateResultingContext
>

/**
 * Middleware that gates access based on the registration state cookie.
 */
export const useRegistrationStateGate: Factory = (options) => async (context) => {

  // parse the allowed return URL domains
  const listOfAllowedDomains = options.allowedReturnUrlDomains.split(',').map((domain) => domain.trim()).filter((domain) => domain !== '');
  if (listOfAllowedDomains.length === 0) {
    logger.error(new Error('no allowed return URL domains are configured'));
    return void context.serverResponse.sendInternalServerErrorHTMLResponse(
      <Unrecoverable />
    );
  }
  logger.debug(`List of allowed return URL domains: ${listOfAllowedDomains.join(', ')}`);

  // If the registration state cookie is not present, return an internal server error
  if (context.incomingMessage.registrationState.payload === undefined) {
    logger.error(new Error('registration state cookie payload is undefined'));
    return void context.serverResponse.sendBadRequestHTMLResponse(
      <BadRequest />
    );
  }
  logger.debug(`Registration state cookie payload: ${JSON.stringify(context.incomingMessage.registrationState.payload)}`);

  // If the registration state cookie does not contain a return URL, return an internal server error
  if (context.incomingMessage.registrationState.payload.returnUrl === undefined) {
    logger.error(new Error('registration state cookie payload return URL is undefined'));
    return void context.serverResponse.sendBadRequestHTMLResponse(<BadRequest />);
  }
  logger.debug(`Registration state cookie payload return URL: ${context.incomingMessage.registrationState.payload.returnUrl.toString()}`);

  // If the registration state cookie contains a return URL, check if it is allowed
  if (isAllowedDomain(context.incomingMessage.registrationState.payload.returnUrl, listOfAllowedDomains) === false) {
    logger.error(new Error('registration state cookie payload return URL is not allowed'));
    return void context.serverResponse.sendBadRequestHTMLResponse(<BadRequest />);
  }
  logger.debug('Registration state cookie payload return URL is allowed');
}
