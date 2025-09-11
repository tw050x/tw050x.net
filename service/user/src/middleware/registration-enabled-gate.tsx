import { ServiceContext } from "@tw050x.net.library/service";
import { sendOKHTMLResponse } from "@tw050x.net.library/service/helper/response/send-ok-html-response";
import { default as RegisterAside } from "../template/component/RegisterAside";

/**
 * Checks if user registration is enabled, and if not, sends a response indicating that registration is disabled.
 *
 * @param context
 * @returns the register aside html partial if registration is disabled
 */
export const registrationEnabledGate = () => async (context: ServiceContext) => {
  const registrationEnabled = context.configuration.get('user.service.registration-enabled');
  if (registrationEnabled === 'false') {
    return void sendOKHTMLResponse(context, await <RegisterAside disabled={true} message="Registration is currently disabled." />);
  }
}
