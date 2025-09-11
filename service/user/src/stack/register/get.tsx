import { logger } from "@tw050x.net.library/logger";
import { useCors } from "@tw050x.net.library/middleware/use-cors";
import { sendInternalServerErrorHTMLResponse } from "@tw050x.net.library/service/helper/response/send-internal-server-error-html-response";
import { defineServiceMiddleware } from "@tw050x.net.library/service";
import { sendOKHTMLResponse } from "@tw050x.net.library/service/helper/response/send-ok-html-response";
import { default as UnrecoverableDocument } from "@tw050x.net.library/uikit/document/Unrecoverable";
import { generateRegisterFormNonce } from "../../helper/generate-register-form-nonce"
import { default as RegisterDocument } from "../../template/document/RegisterDocument";

export default defineServiceMiddleware([
  async (context) => {
    logger.debug(`GET ${context.incomingMessage.url}`);
  },
  useCors({
    getConfiguration: async ({ configuration }) => ({
      allowedMethods: ['GET', 'POST', 'OPTIONS'],
      allowedOrigins: configuration.get('user.service.allowed-origins'),
    }),
  }),

  // Render the registration page in a disabled if it is not enabled
  async (context) => {
    const registrationEnabled = context.configuration.get('user.service.registration-enabled');
    if (registrationEnabled === 'false') {
      const registerAsideProps = {
        disabled: true,
        message: 'Registration is currently disabled.',
      } as const;
      return void sendOKHTMLResponse(context, await <RegisterDocument registerAsideProps={registerAsideProps} />);
    }
  },

  // Render the register page
  async (context) => {
    let nonce;
    try {
      nonce = await generateRegisterFormNonce();
    }
    catch (error) {
      logger.error('unable to generate nonce', { error });
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
