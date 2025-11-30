import { read as readConfig } from "@tw050x.net.library/configs";
import { Middleware, ServiceRequestContext } from "@tw050x.net.library/service";
import { default as RegisterAside } from "@tw050x.net.library/user/template/component/RegisterAside";

/**
 *
 */
type UserRegistrationEnabledGateResultingContext = ServiceRequestContext & {};

/**
 *
 */
type Factory = () => Middleware<
  ServiceRequestContext,
  UserRegistrationEnabledGateResultingContext
>;

/**
 * Checks if user registration is enabled, and if not, sends a response indicating that registration is disabled.
 *
 * @param options
 * @returns the middleware function that performs the check and sends the response if registration is disabled.
 */
export const useRegistrationEnabledGate: Factory = () => async (context) => {
  const registrationEnabled = readConfig('service.*.registration-enabled');

  if (registrationEnabled === undefined) {
    throw new Error('No configuration found for service.*.registration-enabled');
  }

  if (registrationEnabled === 'false') {
    return void context.serverResponse.sendOKHTMLResponse(
      <RegisterAside
        disabled={true}
        message="Registration is currently disabled."
      />
    );
  }
}
