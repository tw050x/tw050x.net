import { logger } from "@tw050x.net.library/logger";
import { ServiceContext } from "@tw050x.net.library/service";
import { isAllowedDomain } from "@tw050x.net.library/utility/is-allowed-domain";
import { createDecipheriv } from "node:crypto";
import { default as Cookies } from "cookies";

type LoginStateCookiePayload = {
  returnUrl: URL;
}

declare module "node:http" {
  interface IncomingMessage {
    loginStateCookie: {
      payload: LoginStateCookiePayload | undefined;
    }
  }
}

type UseLoginStateCookieReaderOptions = {
  getConfiguration: (context: { configuration: ServiceContext['configuration'] }) => Promise<{
    allowedReturnUrlDomains: string;
    cookieName: string;
    stateCipherAlgorithm?: string;
  }>;
  getSecrets: (context: { secrets: ServiceContext['secrets'] }) => Promise<{
    encrypterSecretKey: string;
  }>;
}

const defaultStateCipherAlgorithm = 'aes-256-cbc';

/**
 * @returns void
 */
export const useLoginStateCookieReader = (options: UseLoginStateCookieReaderOptions) => async (context: ServiceContext) => {
  const cookies = new Cookies(context.incomingMessage, context.serverResponse, {
    secure: true,
  });
  let configuration;
  let secrets;
  try {
    configuration = await options.getConfiguration({ configuration: context.configuration });
    secrets = await options.getSecrets({ secrets: context.secrets });
  }
  catch (error) {
    logger.error(error);
    context.serverResponse.statusCode = 500;
    return void context.serverResponse.end();
  }
  const allowedReturnUrlDomainsString = configuration.allowedReturnUrlDomains;
  const cookieName = configuration.cookieName;
  const stateCipherAlgorithm = configuration.stateCipherAlgorithm || defaultStateCipherAlgorithm;
  const encrypterSecretKey = secrets.encrypterSecretKey;
  const cookie = cookies.get(cookieName)
  let loginStateCookiePayload: LoginStateCookiePayload | undefined
  payloadGuard: {
    if (cookie === undefined) {
      break payloadGuard;
    }
    let loginState
    try {
      const parsedCookie = JSON.parse(cookie);
      const decipher = createDecipheriv(stateCipherAlgorithm, Buffer.from(encrypterSecretKey, 'hex'), Buffer.from(parsedCookie.iv, 'hex'));
      let decrypted = decipher.update(parsedCookie.content, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      loginState = JSON.parse(decrypted);
    }
    catch (error) {
      logger.error(error);
      break payloadGuard;
    }
    // ensure login state is an object with a returnUrl property
    if (loginState === undefined) {
      break payloadGuard;
    }
    if (loginState === null) {
      break payloadGuard;
    }
    if (typeof loginState !== 'object') {
      break payloadGuard;
    }
    if ('returnUrl' in loginState === false) {
      break payloadGuard;
    }
    // fetch the allowed return url domains from config
    const listOfAllowedReturnUrlDomains = allowedReturnUrlDomainsString.split(',').map((domain) => domain.trim())
    // ensure that the "allowed_return_url_domains" setting exists
    // return an error if it does not
    if (Array.isArray(listOfAllowedReturnUrlDomains) === false) {
      break payloadGuard;
    }
    // check the return url domain against the allowed return url domains
    // return an error if the return url domain is not allowed
    if (isAllowedDomain(loginState.returnUrl, listOfAllowedReturnUrlDomains) === false) {
      break payloadGuard;
    }
    if (typeof loginState.returnUrl !== 'string') {
      break payloadGuard;
    }
    loginStateCookiePayload = {
      returnUrl: new URL(loginState.returnUrl)
    }
  }
  // initialize the cookies object on the incoming message
  context.incomingMessage.loginStateCookie = {
    payload: loginStateCookiePayload
  }
}
