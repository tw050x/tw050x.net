import { useParameter, readParameter } from "@tw050x.net.library/configuration";
import { logger } from "@tw050x.net.library/logger";
import { useCorsHeaders, UseCorsHeadersFactoryOptions } from "@tw050x.net.library/middleware/use-cors-headers";
import { useLogRequest } from "@tw050x.net.library/middleware/use-log-request";
import { defineServiceMiddleware } from "@tw050x.net.library/service";
import { default as UnrecoverableDocument } from "@tw050x.net.library/uikit/document/Unrecoverable";
import { generateLoginFormNonce } from '../../../../helper/generate-login-form-nonce.js';
import { default as LoginAside } from "../../../../template/component/LoginAside.js";

const useCorsHeadersOptions: UseCorsHeadersFactoryOptions = {
  allowedMethods: ['GET', 'POST'],
  allowedOrigins: useParameter('authentication.service.allowed-origins'),
}

export default defineServiceMiddleware([
  useLogRequest(),
  useCorsHeaders(useCorsHeadersOptions),

  // Render the login page in a disabled if it is not enabled
  async (context) => {
    const loginEnabled = await readParameter('authentication.service.login-enabled');
    if (loginEnabled === 'false') {
      return void context.serverResponse.sendOKHTMLResponse(<LoginAside disabled={true} message="Login is currently disabled." />);
    }
  },

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
