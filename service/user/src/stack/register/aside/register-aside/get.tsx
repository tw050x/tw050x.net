import { logger } from "@tw050x.net.library/logger";
import { useCors } from "@tw050x.net.library/middleware/use-cors";
import { defineServiceMiddleware } from "@tw050x.net.library/service";
import { sendInternalServerErrorHTMLResponse } from "@tw050x.net.library/service/helper/response/send-internal-server-error-html-response";
import { sendOKHTMLResponse } from "@tw050x.net.library/service/helper/response/send-ok-html-response";
import { default as UnrecoverableDocument } from "@tw050x.net.library/uikit/document/Unrecoverable";
import { generateRegisterFormNonce } from '../../../../helper/generate-register-form-nonce';
import { default as RegisterAside } from "../../../../template/component/RegisterAside";

export default defineServiceMiddleware([
  async (context) => {
    logger.debug(`GET ${context.incomingMessage.url}`);
  },
  useCors({
    getConfiguration: async (configuration) => ({
      allowedMethods: ['GET', 'POST'],
      allowedOrigins: configuration.get('user.service.allowed-origins'),
    })
  }),

  // Render the registration page in a disabled if it is not enabled
  async (context) => {
    const registrationEnabled = context.configuration.get('user.service.registration-enabled');
    if (registrationEnabled === 'false') {
      return void sendOKHTMLResponse(context, await <RegisterAside disabled={true} message="Registration is currently disabled." />);
    }
  },

  // Render the login aside
  async (context) => {
    let nonce;
    try {
      nonce = await generateRegisterFormNonce();
    }
    catch (error) {
      logger.error('unable to generate nonce', { error });
      return void sendInternalServerErrorHTMLResponse(context, await <UnrecoverableDocument />);
    }
    return void sendOKHTMLResponse(context, await (
      <aside>
        <RegisterAside
          registerFormProps={{
            email: '',
            nonce,
            validationErrors: []
          }}
        />
      </aside>
    ));
  }
]);
