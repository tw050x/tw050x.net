import { UseCorsHeadersFactoryOptions, useCorsHeaders } from "@tw050x.net.library/platform/middleware/use-cors-headers";
import { logger } from "@tw050x.net.library/platform/helper/logger";
import { useLogRequest } from "@tw050x.net.library/platform/middleware/use-log-request";
import { default as defineServiceMiddleware } from "@tw050x.net.library/platform/middleware";
import { default as UnrecoverableDocument } from "@tw050x.net.library/platform/template/document/Unrecoverable";
import { generateRegisterFormNonce } from "@tw050x.net.library/platform/helper/user/generate-register-form-nonce";
import { useRegistrationEnabledGate } from "@tw050x.net.library/platform/middleware/use-registration-enabled-gate";
import { default as Register } from "@tw050x.net.library/platform/template/document/Register";

const useCorsHeadersOptions: UseCorsHeadersFactoryOptions = {
  allowedMethods: ['GET', 'OPTIONS', 'POST'],
}

export default defineServiceMiddleware([
  useLogRequest(),
  useCorsHeaders(useCorsHeadersOptions),
  useRegistrationEnabledGate(),

  // Render the register page
  async (context) => {
    let nonce;
    try {
      nonce = await generateRegisterFormNonce();
    }
    catch (error) {
      logger.error(error);
      return void context.serverResponse.sendInternalServerErrorHTMLResponse(<UnrecoverableDocument />);
    }
    const registerAsideProps = {
      registerFormProps: {
        email: '',
        nonce,
        validationErrors: []
      }
    }
    return void context.serverResponse.sendOKHTMLResponse(<Register registerAsideProps={registerAsideProps} />);
  }
])
