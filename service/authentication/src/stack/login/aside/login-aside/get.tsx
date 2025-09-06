import { logger } from "@tw050x.net.library/logger";
import { useCors } from "@tw050x.net.library/middleware/use-cors";
import { defineServiceMiddleware } from "@tw050x.net.library/service";
import { sendInternalServerErrorHTMLResponse } from "@tw050x.net.library/service/helper/response/send-internal-server-error-html-response";
import { sendOKHTMLResponse } from "@tw050x.net.library/service/helper/response/send-ok-html-response";
import { default as UnrecoverableDocument } from "@tw050x.net.library/uikit/document/Unrecoverable";
import { generateLoginFormNonce } from '../../../../helper/generate-login-form-nonce';
import { default as LoginAside } from "../../../../template/component/LoginAside";

export default defineServiceMiddleware([
  async (context) => {
    logger.debug(`GET ${context.incomingMessage.url}`);
  },
  useCors({
    getConfiguration: async (configuration) => ({
      allowedMethods: ['GET', 'POST'],
      allowedOrigins: configuration.get('authentication.service.allowed-origins'),
    })
  }),

  // Render the login page in a disabled if it is not enabled
  async (context) => {
    const loginEnabled = context.configuration.get('authentication.service.login-enabled');
    if (loginEnabled === 'false') {
      return void sendOKHTMLResponse(context, await <LoginAside disabled={true} message="Login is currently disabled." />);
    }
  },

  // Render the login aside
  async (context) => {
    let nonce;
    try {
      nonce = await generateLoginFormNonce();
    }
    catch (error) {
      logger.error('unable to generate nonce', { error });
      return void sendInternalServerErrorHTMLResponse(context, await <UnrecoverableDocument />);
    }
    return void sendOKHTMLResponse(context, await (
      <aside>
        <LoginAside
          loginFormProps={{
            email: '',
            nonce,
            validationErrors: []
          }}
        />
      </aside>
    ));
  }
]);
