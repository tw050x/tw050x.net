import { default as logger } from "@tw050x.net/logger";
import { ServiceContext } from "@tw050x.net/service";
import { default as Cookies } from "cookies";
import { verify } from "jsonwebtoken";

type AccessTokenCookie = {
  authorised: boolean | null;
  errors: Array<Error>;
  payload?: {
    rol: Array<string>;
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
    requiredPermissions: Array<string>;
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
  const requiredPermissions = configuration.requiredPermissions;

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

    if (Array.isArray(accessTokenPayload.rol) === false) {
      logger.error('access token payload rol is not an array');
      accessTokenCookie.errors.push(new Error('access token payload rol is not an array'));
      break verifyCookieGuard;
    }

    const rol = accessTokenPayload.rol;
    if (rol.find((rol) => typeof rol !== 'string') !== undefined) {
      logger.error('access token payload rol contains non-string values');
      accessTokenCookie.errors.push(new Error('access token payload rol contains non-string values'));
      break verifyCookieGuard;
    }

    const sub = accessTokenPayload.sub;
    if (typeof sub !== 'string') {
      logger.error('access token payload sub is not a string');
      accessTokenCookie.errors.push(new Error('access token payload sub is not a string'));
      break verifyCookieGuard;
    }

    let hasAllPermissions = true;
    for (const requiredPermission of requiredPermissions) {
      if (rol.includes(requiredPermission) === true) continue;
      else hasAllPermissions = false;
    }
    if (hasAllPermissions === true) context.incomingMessage.accessTokenCookie.authorised = true;
    else context.incomingMessage.accessTokenCookie.authorised = false;

    accessTokenCookie.payload = {
      rol,
      sub,
    }
  }

  context.incomingMessage.accessTokenCookie = accessTokenCookie;
}
