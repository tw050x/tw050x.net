import { read as readConfig } from "@tw050x.net.library/configs";
import { useCorsHeaders, UseCorsHeadersFactoryOptions } from "@tw050x.net.library/cors/use-cors-headers";
import { logger } from "@tw050x.net.library/logger";
import { useLogRequest } from "@tw050x.net.library/middleware/use-log-request";
import { defineServiceMiddleware } from "@tw050x.net.library/service";
import { default as UnrecoverableDocument } from "@tw050x.net.library/uikit/document/Unrecoverable";
import { RegistrationEnabledGateOptions, useRegistrationEnabledGate } from "../../../../middleware/use-registration-enabled-gate.js";
import { generateRegisterFormNonce } from '../../../../helper/generate-register-form-nonce.js';
import { default as RegisterAside } from "../../../../template/component/RegisterAside.js";

const useCorsHeadersOptions: UseCorsHeadersFactoryOptions = {
  allowedMethods: ['GET', 'POST'],
  allowedOrigins: readConfig('service.user.allowed-origins'),
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
      return void context.serverResponse.sendInternalServerErrorHTMLResponse(<UnrecoverableDocument />);
    }
    return void context.serverResponse.sendOKHTMLResponse(
      <aside>
        <RegisterAside
          registerFormProps={{
            email: '',
            nonce,
            validationErrors: []
          }}
        />
      </aside>
    );
  }
]);
