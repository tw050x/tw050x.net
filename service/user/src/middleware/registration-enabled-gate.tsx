import { ServiceContext } from "@tw050x.net.library/service";
import { sendOKHTMLResponse } from "@tw050x.net.library/service/helper/response/send-ok-html-response";

/**
 * Options for the registrationEnabledGate middleware.
 */
export type RegistrationEnabledGateOptions = {
  getResponseHtml: () => Promise<JSX.Element>;
}

/**
 * Checks if user registration is enabled, and if not, sends a response indicating that registration is disabled.
 *
 * @param options
 * @returns the middleware function that performs the check and sends the response if registration is disabled.
 */
export const registrationEnabledGate = ({ getResponseHtml }: RegistrationEnabledGateOptions) => async (context: ServiceContext) => {
  const registrationEnabled = context.configuration.get('user.service.registration-enabled');
  if (registrationEnabled === 'false') {
    return void sendOKHTMLResponse(context, await getResponseHtml());
  }
}
