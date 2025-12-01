import { read as readConfig } from "../helper/configs.js";
import { Middleware } from "../middleware.js";
import { ServiceRequestContext } from "../types.js";


/**
 *
 */
type UseRegistrationEnabledResultingContext = ServiceRequestContext & {
  incomingMessage: ServiceRequestContext['incomingMessage'] & {
    registrationEnabled: boolean;
  }
};

/**
 *
 */
type Factory = () => Middleware<
  ServiceRequestContext,
  UseRegistrationEnabledResultingContext
>;

/**
 * Checks if user registration is enabled, and if not, sends a response indicating that registration is disabled.
 *
 * @param options
 * @returns the middleware function that performs the check and sends the response if registration is disabled.
 */
export const useRegistrationEnabled: Factory = () => async (context) => {
  const registrationEnabled = readConfig('service.*.registration-enabled');
  context.incomingMessage.registrationEnabled = registrationEnabled === 'true';
}
