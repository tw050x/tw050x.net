import { useParameter } from "@tw050x.net.library/configuration";
import { logger } from "@tw050x.net.library/logger";
import { UseCorsHeadersFactoryOptions, useCorsHeaders } from "@tw050x.net.library/middleware/use-cors-headers";
import { useLogRequest } from "@tw050x.net.library/middleware";
import { sendInternalServerErrorHTMLResponse } from "@tw050x.net.library/service/helper/response/send-internal-server-error-html-response";
import { defineServiceMiddleware } from "@tw050x.net.library/service";
import { sendOKHTMLResponse } from "@tw050x.net.library/service/helper/response/send-ok-html-response";
import { default as UnrecoverableDocument } from "@tw050x.net.library/uikit/document/Unrecoverable";
import { RegistrationEnabledGateOptions, useRegistrationEnabledGate } from "../../middleware/use-registration-enabled-gate";
import { generateRegisterFormNonce } from "../../helper/generate-register-form-nonce"
import { default as RegisterDocument } from "../../template/document/RegisterDocument";

const useCorsHeadersOptions: UseCorsHeadersFactoryOptions = {
  allowedMethods: ['GET', 'OPTIONS', 'POST'],
  allowedOrigins: useParameter('user.service.allowed-origins'),
}

const useRegistrationEnabledGateOptions: RegistrationEnabledGateOptions = {
  getResponseHtml: async () => (
    <RegisterDocument
      registerAsideProps={{
        disabled: true,
        message: "Registration is currently disabled."
      }}
    />
  )
}

export default defineServiceMiddleware([
  useLogRequest(),
  useCorsHeaders(useCorsHeadersOptions),
  useRegistrationEnabledGate(useRegistrationEnabledGateOptions),

  // Render the register page
  async (context) => {
    let nonce;
    try {
      nonce = await generateRegisterFormNonce();
    }
    catch (error) {
      logger.error(error);
      return void sendInternalServerErrorHTMLResponse(context, await <UnrecoverableDocument />);
    }
    const registerAsideProps = {
      registerFormProps: {
        email: '',
        nonce,
        validationErrors: []
      }
    }
    return void sendOKHTMLResponse(context, await <RegisterDocument registerAsideProps={registerAsideProps} />);
  }
])
