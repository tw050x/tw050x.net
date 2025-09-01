import { logger } from "@tw050x.net/logger";
import { ServiceContext } from "@tw050x.net/service";
import { createCipheriv, randomBytes } from 'node:crypto';
import { default as Cookies } from "cookies";

declare module "node:http" {
  interface ServerResponse {
    loginStateCookie: {
      clear: () => void;
      set: (value: string) => void;
    }
  }
}

type UseLoginStateCookieWriterOptions = {
  getConfiguration: (context: ServiceContext['configuration']) => Promise<{
    cookieName: string;
    cookieDomain: string;
    stateCipherAlgorithm?: string;
  }>;
  getSecrets: (context: ServiceContext['secrets']) => Promise<{
    encrypterSecretKey: string;
  }>;
}

/**
 * @returns void
 */
export const useLoginStateCookieWriter = (options: UseLoginStateCookieWriterOptions) => async (context: ServiceContext) => {
  const cookies = new Cookies(context.incomingMessage, context.serverResponse, {
    secure: true,
  });

  let configuration;
  let secrets;

  try {
    configuration = await options.getConfiguration(context.configuration);
    secrets = await options.getSecrets(context.secrets);
  }
  catch (error) {
    logger.error('unable to read access token cookie', { error });
    context.serverResponse.statusCode = 500;
    return void context.serverResponse.end();
  }

  const cookieName = configuration.cookieName;
  const cookieDomain = configuration.cookieDomain;
  const stateCipherAlgorithm = configuration.stateCipherAlgorithm || 'aes-256-cbc';
  const encrypterSecretKey = secrets.encrypterSecretKey;

  const clearLoginStateCookie = () => {
    cookies.set(cookieName, '', {
      domain: cookieDomain,
      httpOnly: false,
      path: '/login',
      sameSite: 'strict',
      secure: true,
    });
  }

  const setLoginStateCookie = (state: string) => {
    const iv = randomBytes(16);
    const cipher = createCipheriv(stateCipherAlgorithm, Buffer.from(encrypterSecretKey, 'hex'), iv);
    let encrypted = cipher.update(state, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    const value = JSON.stringify({
      iv: iv.toString('hex'),
      content: encrypted
    })

    cookies.set(cookieName, value, {
      domain: cookieDomain,
      httpOnly: false,
      path: '/login',
      sameSite: 'strict',
      secure: true,
    });
  }

  // initialize the cookies object on the incoming message
  context.serverResponse.loginStateCookie = {
    clear: clearLoginStateCookie,
    set: setLoginStateCookie
  };
}
