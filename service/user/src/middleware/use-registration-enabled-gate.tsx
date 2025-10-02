import { readParameter } from "@tw050x.net.library/configuration";
import { Middleware, ServiceContext } from "@tw050x.net.library/service";
import { sendOKHTMLResponse } from "@tw050x.net.library/service/helper/response/send-ok-html-response";

/**
 * Options for the useRegistrationEnabledGate middleware.
 */
export type RegistrationEnabledGateOptions = {
  getResponseHtml: () => Promise<JSX.Element>;
}

/**
 *
 */
type UserRegistrationEnabledGateResultingContext = ServiceContext & {};

/**
 *
 */
type Factory = (options: RegistrationEnabledGateOptions) => Middleware<
  ServiceContext,
  UserRegistrationEnabledGateResultingContext
>;

/**
 * Checks if user registration is enabled, and if not, sends a response indicating that registration is disabled.
 *
 * @param options
 * @returns the middleware function that performs the check and sends the response if registration is disabled.
 */
export const useRegistrationEnabledGate: Factory = ({ getResponseHtml }) => async (context) => {
  const registrationEnabled = await readParameter('user.service.registration-enabled');

  if (registrationEnabled === undefined) {
    throw new Error('No configuration found for user.service.registration-enabled');
  }

  if (registrationEnabled === 'false') {
    return void sendOKHTMLResponse(context, await getResponseHtml());
  }
}
