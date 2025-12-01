import { read as readConfig } from "../helper/configs.js";
import { Middleware } from "../middleware.js";
import { ServiceRequestContext } from "../types.js";

/**
 * The resulting context for the useLoginState middleware.
 */
export type UseLoginStateResultingContext = ServiceRequestContext & {
  incomingMessage: ServiceRequestContext['incomingMessage'] & {
    loginEnabled: boolean;
  }
}

/**
 * Middleware factory for the login enabled gate.
 */
type Factory = () => Middleware<
  ServiceRequestContext,
  UseLoginStateResultingContext
>

/**
 * Middleware that reads config to determine whether login is enabled.
 */
export const useLoginEnabled: Factory = () => async (context) => {
  const loginEnabled = readConfig('service.*.login-enabled');
  context.incomingMessage.loginEnabled = loginEnabled === 'true';
}
