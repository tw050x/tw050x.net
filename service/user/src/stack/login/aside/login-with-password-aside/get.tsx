import { read as readConfig } from "@tw050x.net.library/configs";
import { useCorsHeaders, UseCorsHeadersFactoryOptions } from "@tw050x.net.library/cors/use-cors-headers";
import { logger } from "@tw050x.net.library/logger";
import { useLogRequest } from "@tw050x.net.library/middleware/use-log-request";
import { defineServiceMiddleware } from "@tw050x.net.library/service";
import { default as Unrecoverable } from "@tw050x.net.library/uikit/document/Unrecoverable";
import { generateLoginFormNonce } from '../../../../helper/generate-login-form-nonce.js';
import { useLoginEnabledGate } from "../../../../middleware/use-login-enabled-gate.js";
import { default as LoginWithPasswordAside } from "../../../../template/component/LoginWithPasswordAside.js";

const useCorsHeadersOptions: UseCorsHeadersFactoryOptions = {
  allowedMethods: ['GET', 'POST'],
  allowedOrigins: readConfig('service.user.allowed-origins'),
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
      return void context.serverResponse.sendInternalServerErrorHTMLResponse(
        <Unrecoverable />
      );
    }

    return void context.serverResponse.sendOKHTMLResponse(
      <aside class="disable-animation">
        <LoginWithPasswordAside
          loginWithPasswordFormProps={{
            email: '',
            nonce,
            validationErrors: []
          }}
        />
      </aside>
    );
  }
]);
