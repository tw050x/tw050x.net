import { logger } from "@tw050x.net.library/logger";
import { ServiceContext } from "@tw050x.net.library/service";
import { default as Cookies } from "cookies";
import { verify } from "jsonwebtoken";

type RefreshTokenCookie = {
  errors: Array<Error>;
  payload?: {
    sub: string;
  }
  raw?: string;
}

declare module "node:http" {
  interface IncomingMessage {
    refreshTokenCookie: RefreshTokenCookie;
  }
}

type UseRefreshTokenCookieReaderOptions = {
  getConfiguration: (context: { configuration: ServiceContext['configuration'] }) => Promise<{
    cookieName: string;
  }>;
  getSecrets: (context: { secrets: ServiceContext['secrets'] }) => Promise<{
    jwtSecretKey: string;
  }>;
}

/**
 * @returns void
 */
export const useRefreshTokenCookieReader = (options: UseRefreshTokenCookieReaderOptions) => async (context: ServiceContext) => {
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
  const cookieName = configuration.cookieName;
  const jwtSecretKey = secrets.jwtSecretKey;
  const cookie = cookies.get(cookieName);
  const refreshTokenCookie: RefreshTokenCookie = {
    errors: [] as Array<Error>,
    raw: cookie,
  }
  verifyCookieGuard: {
    if (cookie === undefined) {
      break verifyCookieGuard;
    }
    let refreshTokenPayload;
    try {
      refreshTokenPayload = verify(cookie, jwtSecretKey);
    }
    catch (error) {
      logger.error(error);
      refreshTokenCookie.errors.push(new Error('unable to verify refresh token cookie'));
      break verifyCookieGuard;
    }
    if (typeof refreshTokenPayload === 'string') {
      logger.error('refresh token payload is a string');
      refreshTokenCookie.errors.push(new Error('refresh token payload is not an object'));
      break verifyCookieGuard;
    }
    const sub = refreshTokenPayload.sub;
    if (typeof sub !== 'string') {
      logger.error('refresh token payload sub is not a string');
      refreshTokenCookie.errors.push(new Error('refresh token payload sub is not a string'));
      break verifyCookieGuard;
    }
    refreshTokenCookie.payload = {
      sub,
    };
  }
  context.incomingMessage.refreshTokenCookie = refreshTokenCookie;
}
