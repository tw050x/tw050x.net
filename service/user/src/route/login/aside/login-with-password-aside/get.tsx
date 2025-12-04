import { generateLoginFormNonce } from "@tw050x.net.library/platform/helper/authentication/generate-login-form-nonce";
import { useLoginEnabled } from "@tw050x.net.library/platform/middleware/use-login-enabled";
import { useLoginEnabledGate } from "@tw050x.net.library/platform/middleware/use-login-enabled-gate";
import { default as LoginWithPasswordAside } from "@tw050x.net.library/platform/template/component/LoginWithPasswordAside";
import { useCorsHeaders } from "@tw050x.net.library/platform/middleware/use-cors-headers";
import { logger } from "@tw050x.net.library/platform/helper/logger";
import { useLogRequest } from "@tw050x.net.library/platform/middleware/use-log-request";
import { default as defineServiceMiddleware } from "@tw050x.net.library/platform/middleware";
import { default as Unrecoverable } from "@tw050x.net.library/platform/template/document/Unrecoverable";

export default defineServiceMiddleware([
  useLogRequest(),
  useCorsHeaders({
    allowedMethods: ['GET', 'POST'],
  }),
  useLoginEnabled(),
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
