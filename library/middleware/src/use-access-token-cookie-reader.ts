import { logger } from "@tw050x.net.library/logger";
import { ServiceContext } from "@tw050x.net.library/service";
import { default as Cookies } from "cookies";
import { verify } from "jsonwebtoken";

type AccessTokenCookie = {
  authorised: boolean | null;
  errors: Array<Error>;
  payload?: {
    sub: string;
    uid?: string;
  }
  raw?: string;
}

declare module "node:http" {
  interface IncomingMessage {
    accessTokenCookie: AccessTokenCookie
  }
}

type UseAccessTokenCookieReaderOptions = {
  getConfiguration: (context: ServiceContext['configuration']) => Promise<{
    cookieName: string;
    requiredPermissions?: Array<string>;
  }>;
  getSecrets: (context: ServiceContext['secrets']) => Promise<{
    jwtSecretKey: string;
  }>;
}

/**
 * @returns void
 */
export const useAccessTokenCookieReader = (options: UseAccessTokenCookieReaderOptions) => async (context: ServiceContext) => {
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
  const jwtSecretKey = secrets.jwtSecretKey;
  const requiredPermissions = configuration.requiredPermissions || [];

  const cookie = cookies.get(cookieName);

  const accessTokenCookie: AccessTokenCookie = {
    authorised: null,
    errors: [] as Array<Error>,
    raw: cookie,
  }

  verifyCookieGuard: {
    if (cookie === undefined) {
      break verifyCookieGuard;
    }

    let accessTokenPayload;
    try {
      accessTokenPayload = verify(cookie, jwtSecretKey);
    }
    catch (error) {
      logger.error('unable to verify access token cookie', { error });
      accessTokenCookie.errors.push(new Error('unable to verify access token cookie'))
      break verifyCookieGuard;
    }

    if (typeof accessTokenPayload === 'string') {
      logger.error('access token payload is a string');
      accessTokenCookie.errors.push(new Error('access token payload is not an object'));
      break verifyCookieGuard;
    }

    const sub = accessTokenPayload.sub;
    if (typeof sub !== 'string') {
      logger.error('access token payload sub is not a string');
      accessTokenCookie.errors.push(new Error('access token payload sub is not a string'));
      break verifyCookieGuard;
    }

    // TODO: check for user permissions in the databases

    let hasAllPermissions = true;
    for (const requiredPermission of requiredPermissions) {
      // if (rol.includes(requiredPermission) === true) continue;
      // else hasAllPermissions = false;
    }
    if (hasAllPermissions === true) accessTokenCookie.authorised = true;
    else accessTokenCookie.authorised = false;
    accessTokenCookie.payload = {
      sub,
    }
  }

  context.incomingMessage.accessTokenCookie = accessTokenCookie;
}
