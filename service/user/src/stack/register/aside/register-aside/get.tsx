import { useParameter } from "@tw050x.net.library/configuration";
import { logger } from "@tw050x.net.library/logger";
import { useCorsHeaders, UseCorsHeadersFactoryOptions } from "@tw050x.net.library/middleware/use-cors-headers";
import { useLogRequest } from "@tw050x.net.library/middleware/use-log-request";
import { defineServiceMiddleware } from "@tw050x.net.library/service";
import { sendInternalServerErrorHTMLResponse } from "@tw050x.net.library/service/helper/response/send-internal-server-error-html-response";
import { sendOKHTMLResponse } from "@tw050x.net.library/service/helper/response/send-ok-html-response";
import { default as UnrecoverableDocument } from "@tw050x.net.library/uikit/document/Unrecoverable";
import { RegistrationEnabledGateOptions, useRegistrationEnabledGate } from "../../../../middleware/use-registration-enabled-gate";
import { generateRegisterFormNonce } from '../../../../helper/generate-register-form-nonce';
import { default as RegisterAside } from "../../../../template/component/RegisterAside";

const useCorsHeadersOptions: UseCorsHeadersFactoryOptions = {
  allowedMethods: ['GET', 'POST'],
  allowedOrigins: useParameter('user.service.allowed-origins'),
}

const useRegistrationEnabledGateOptions: RegistrationEnabledGateOptions = {
  getResponseHtml: async () => (
    <RegisterAside
      disabled={true}
      message="Registration is currently disabled."
    />
  )
}

export default defineServiceMiddleware([
  useLogRequest(),
  useCorsHeaders(useCorsHeadersOptions),
  useRegistrationEnabledGate(useRegistrationEnabledGateOptions),

  // Render the login aside
  async (context) => {
    let nonce;
    try {
      nonce = await generateRegisterFormNonce();
    }
    catch (error) {
      logger.error(error);
      return void sendInternalServerErrorHTMLResponse(context, await <UnrecoverableDocument />);
    }
    return void sendOKHTMLResponse(context, await (
      <aside>
        <RegisterAside
          registerFormProps={{
            email: '',
            nonce,
            validationErrors: []
          }}
        />
      </aside>
    ));
  }
]);
