import { Middleware, ServiceRequestContext } from "@tw050x.net.library/service";
import { serviceParameters } from "../parameters.js";

/**
 * Options for the useRegistrationEnabledGate middleware.
 */
export type RegistrationEnabledGateOptions = {
  getResponseHtml: () => Promise<JSX.Element>;
}

/**
 *
 */
type UserRegistrationEnabledGateResultingContext = ServiceRequestContext & {};

/**
 *
 */
type Factory = (options: RegistrationEnabledGateOptions) => Middleware<
  ServiceRequestContext,
  UserRegistrationEnabledGateResultingContext
>;

/**
 * Checks if user registration is enabled, and if not, sends a response indicating that registration is disabled.
 *
 * @param options
 * @returns the middleware function that performs the check and sends the response if registration is disabled.
 */
export const useRegistrationEnabledGate: Factory = ({ getResponseHtml }) => async (context) => {
  const registrationEnabled = serviceParameters.getParameter('user.service.registration-enabled');

  if (registrationEnabled === undefined) {
    throw new Error('No configuration found for user.service.registration-enabled');
  }

  if (registrationEnabled === 'false') {
    return void context.serverResponse.sendOKHTMLResponse(await getResponseHtml());
  }
}
