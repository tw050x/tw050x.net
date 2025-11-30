import { useCorsHeaders, UseCorsHeadersFactoryOptions } from "@tw050x.net.library/cors/use-cors-headers";
import { logger } from "@tw050x.net.library/logger";
import { useLogRequest } from "@tw050x.net.library/middleware/use-log-request";
import { defineServiceMiddleware } from "@tw050x.net.library/service";
import { default as UnrecoverableDocument } from "@tw050x.net.library/uikit/document/Unrecoverable";
import { generateRegisterFormNonce } from "@tw050x.net.library/user/helper/generate-register-form-nonce";
import { useRegistrationEnabledGate } from "@tw050x.net.library/user/middleware/use-registration-enabled-gate";
import { default as RegisterAside } from "@tw050x.net.library/user/template/component/RegisterAside";

const useCorsHeadersOptions: UseCorsHeadersFactoryOptions = {
  allowedMethods: ['GET', 'POST'],
}

export default defineServiceMiddleware([
  useLogRequest(),
  useCorsHeaders(useCorsHeadersOptions),
  useRegistrationEnabledGate(),

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
