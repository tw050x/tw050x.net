import { logger } from "@tw050x.net/logger-library";
import { useCors } from "@tw050x.net/middleware-library/use-cors";
import { defineServiceMiddleware } from "@tw050x.net/service-library";
import { sendInternalServerErrorHTMLResponse } from "@tw050x.net/service-library/helper/response/send-internal-server-error-html-response";
import { sendOKHTMLResponse } from "@tw050x.net/service-library/helper/response/send-ok-html-response";
import { default as UnrecoverableDocument } from "@tw050x.net/uikit-library/document/Unrecoverable";
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
