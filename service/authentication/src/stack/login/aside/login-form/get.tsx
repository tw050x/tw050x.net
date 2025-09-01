import { logger } from "@tw050x.net/logger";
import { useCors } from "@tw050x.net/middleware/use-cors";
import { defineServiceMiddleware } from "@tw050x.net/service";
import { sendInternalServerErrorHTMLResponse } from "@tw050x.net/service/helper/response/send-internal-server-error-html-response";
import { sendOKHTMLResponse } from "@tw050x.net/service/helper/response/send-ok-html-response";
import { default as UnrecoverableDocument } from "@tw050x.net/uikit/document/Unrecoverable";
import { default as LoginForm } from "../../../../template/component/LoginForm";
import { generateLoginFormNonce } from '../../../../helper/generate-login-form-nonce';

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
        <LoginForm nonce={nonce} />
      </aside>
    ));
  }
]);
