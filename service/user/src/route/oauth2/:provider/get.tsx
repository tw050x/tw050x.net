import { useLoginEnabled } from "@tw050x.net.library/platform/middleware/use-login-enabled";
import { useLoginEnabledGate } from "@tw050x.net.library/platform/middleware/use-login-enabled-gate";
import { useLoginState } from "@tw050x.net.library/platform/middleware/use-login-state";
import { googleAuthorisationURL } from "@tw050x.net.library/platform/helper/authentication/oauth2/provider/google";
import { read as readConfig } from "@tw050x.net.library/platform/helper/configs";
import { UseCorsHeadersFactoryOptions, useCorsHeaders } from "@tw050x.net.library/platform/middleware/use-cors-headers";
import { encrypt } from "@tw050x.net.library/platform/helper/encrypt";
import { logger } from "@tw050x.net.library/platform/helper/logger";
import { useLogRequest } from "@tw050x.net.library/platform/middleware/use-log-request";
import { read as readSecret } from "@tw050x.net.library/platform/helper/secrets";
import { default as defineServiceMiddleware } from "@tw050x.net.library/platform/middleware";
import { default as Unrecoverable } from "@tw050x.net.library/platform/template/document/Unrecoverable";
import { randomBytes } from 'node:crypto';

const useCorsHeadersOptions: UseCorsHeadersFactoryOptions = {
  allowedMethods: ['GET', 'OPTIONS'],
}

export default defineServiceMiddleware([
  useLogRequest(),
  useCorsHeaders(useCorsHeadersOptions),
  useLoginEnabled(),
  useLoginEnabledGate(),
  useLoginState(),

  // user is not authenticated and does not have a valid refresh token
  async (context) => {
    const { provider } = await context.incomingMessage.useUrlParams('/oauth2/:provider');

    const state = JSON.stringify({
      attempt: 1,
      returnUrl: context.incomingMessage.loginState.cookie.payload?.returnUrl ?? new URL('/', `https://${readConfig('service.*.host')}`),
      salt: randomBytes(16).toString('hex'),
    })

    let encryptedState;
    try {
      encryptedState = encrypt(state, readSecret('encrypter.secret-key'))
    }
    catch (error) {
      logger.error(error);
      logger.debug('Failed to encrypt state parameter for OAuth2 authorisation URL');
      return void context.serverResponse.sendInternalServerErrorHTMLResponse(
        <Unrecoverable />
      );
    }

    let authorisationURL: URL;
    switch (provider) {
      case 'google':
        authorisationURL = googleAuthorisationURL({
          clientId: readConfig('oauth2.google.client-id'),
          redirectUrl: new URL('/oauth2/google/callback', `https://${readConfig('service.*.host')}`),
          state: encryptedState,
        })
        break;
      default:
        logger.debug(`Unsupported OAuth2 provider requested: ${provider}`);
        logger.error(new Error(`Unsupported OAuth2 provider`));
        return void context.serverResponse.sendInternalServerErrorHTMLResponse(
          <Unrecoverable />
        )
    }

    return void context.serverResponse.sendSeeOtherRedirect(authorisationURL);
  }
])
