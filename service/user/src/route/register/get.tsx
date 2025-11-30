import { UseCorsHeadersFactoryOptions, useCorsHeaders } from "@tw050x.net.library/cors/use-cors-headers";
import { logger } from "@tw050x.net.library/logger";
import { useLogRequest } from "@tw050x.net.library/middleware";
import { defineServiceMiddleware } from "@tw050x.net.library/service";
import { default as UnrecoverableDocument } from "@tw050x.net.library/uikit/document/Unrecoverable";
import { generateRegisterFormNonce } from "@tw050x.net.library/user/helper/generate-register-form-nonce";
import { useRegistrationEnabledGate } from "@tw050x.net.library/user/middleware/use-registration-enabled-gate";
import { default as RegisterDocument } from "@tw050x.net.library/user/template/document/RegisterDocument";

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
    return void context.serverResponse.sendOKHTMLResponse(<RegisterDocument registerAsideProps={registerAsideProps} />);
  }
])
