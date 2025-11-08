import { logger } from "@tw050x.net.library/logger";
import { useCorsHeaders, UseCorsHeadersFactoryOptions } from "@tw050x.net.library/cors/use-cors-headers";
import { useLogRequest } from "@tw050x.net.library/middleware/use-log-request";
import { defineServiceMiddleware } from "@tw050x.net.library/service";
import { default as UnrecoverableDocument } from "@tw050x.net.library/uikit/document/Unrecoverable";
import { generateLoginFormNonce } from '../../../../helper/generate-login-form-nonce.js';
import { useLoginEnabledGate } from "../../../../middleware/use-login-enabled-gate.js";
import { default as LoginAside } from "../../../../template/component/LoginAside.js";
import { serviceParameters } from "../../../../parameters.js";

const useCorsHeadersOptions: UseCorsHeadersFactoryOptions = {
  allowedMethods: ['GET', 'POST'],
  allowedOrigins: serviceParameters.getParameter('authentication.service.allowed-origins'),
}

export default defineServiceMiddleware([
  useLogRequest(),
  useCorsHeaders(useCorsHeadersOptions),
  useLoginEnabledGate(),

  // Render the login aside
  async (context) => {
    let nonce;
    try {
      nonce = await generateLoginFormNonce();
    }
    catch (error) {
      logger.error(error);
      return void context.serverResponse.sendInternalServerErrorHTMLResponse(<UnrecoverableDocument />);
    }
    return void context.serverResponse.sendOKHTMLResponse(
      <aside>
        <LoginAside
          loginFormProps={{
            email: '',
            nonce,
            validationErrors: []
          }}
        />
      </aside>
    );
  }
]);
