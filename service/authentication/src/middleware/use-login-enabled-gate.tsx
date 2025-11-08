import { Middleware } from "@tw050x.net.library/service";
import { default as LoginDocument } from "../template/document/LoginDocument.js";
import { serviceParameters } from "../parameters.js";

/**
 * Middleware factory for the login enabled gate.
 */
type Factory = () => Middleware

/**
 * Middleware that gates access based on whether login is enabled.
 */
export const useLoginEnabledGate: Factory = () => async (context) => {
  const loginEnabled = serviceParameters.getParameter('authentication.service.login-enabled');
  if (loginEnabled === 'false') {
    const loginAsideProps = {
      disabled: true,
      message: 'Login is currently disabled.',
    } as const;
    return void context.serverResponse.sendOKHTMLResponse(<LoginDocument loginAsideProps={loginAsideProps} />);
  }
}
