import { generateLoginFormNonce } from "@tw050x.net.library/platform/helper/authentication/generate-login-form-nonce";
import { useLoginEnabled } from "@tw050x.net.library/platform/middleware/use-login-enabled";
import { useLoginEnabledGate } from "@tw050x.net.library/platform/middleware/use-login-enabled-gate";
import { default as LoginWithOAuthAside } from "@tw050x.net.library/platform/template/component/LoginWithOAuthAside";
import { useCorsHeaders, UseCorsHeadersFactoryOptions } from "@tw050x.net.library/platform/middleware/use-cors-headers";
import { logger } from "@tw050x.net.library/platform/helper/logger";
import { useLogRequest } from "@tw050x.net.library/platform/middleware/use-log-request";
import { default as defineServiceMiddleware } from "@tw050x.net.library/platform/middleware";
import { default as UnrecoverableDocument } from "@tw050x.net.library/platform/template/document/Unrecoverable";

const useCorsHeadersOptions: UseCorsHeadersFactoryOptions = {
  allowedMethods: ['GET', 'POST'],
}

export default defineServiceMiddleware([
  useLogRequest(),
  useCorsHeaders(useCorsHeadersOptions),
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
      return void context.serverResponse.sendInternalServerErrorHTMLResponse(<UnrecoverableDocument />);
    }

    const loginWithOAuthAsideProps = {
      oauthProviders: {
        google: { enabled: true },
      }
    }

    return void context.serverResponse.sendOKHTMLResponse(
      <aside class="disable-animation">
        <LoginWithOAuthAside {...loginWithOAuthAsideProps} />
      </aside>
    );
  }
]);
