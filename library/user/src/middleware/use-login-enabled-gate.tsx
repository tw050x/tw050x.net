import { Middleware, ServiceRequestContext } from "@tw050x.net.library/service";
import { UseLoginStateResultingContext } from "./use-login-enabled.js";
import { default as LoginWithPassword } from "../template/document/LoginWithPassword.js";

/**
 * The resulting context for the useLoginEnabledGate middleware.
 */
type Context = ServiceRequestContext & UseLoginStateResultingContext;

/**
 * Middleware factory for the login enabled gate.
 */
type Factory = () => Middleware<Context>

/**
 * Middleware that gates access based on whether login is enabled.
 */
export const useLoginEnabledGate: Factory = () => async (context) => {
  if (context.incomingMessage.loginEnabled === false) {
    const loginAsideProps = {
      disabled: true,
      message: 'Login is currently disabled.',
    } as const;
    return void context.serverResponse.sendOKHTMLResponse(
      <LoginWithPassword
        loginWithPasswordAsideProps={loginAsideProps}
      />
    );
  }
}
