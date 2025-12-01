import { read as readConfig } from "../helper/configs.js";
import { default as RegisterAside } from "../template/component/RegisterAside.js";
import { Middleware } from "../middleware.js";
import { ServiceRequestContext } from "../types.js";

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
