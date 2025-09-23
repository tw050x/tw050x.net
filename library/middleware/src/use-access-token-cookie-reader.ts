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
  getConfiguration: (context: { configuration: ServiceContext['configuration'] }) => Promise<{
    cookieName: string;
    requiredPermissions?: Array<string>;
  }>;
  getSecrets: (context: { secrets: ServiceContext['secrets'] }) => Promise<{
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

    // verify the cookie
    let accessTokenPayload;
    try {
      accessTokenPayload = verify(cookie, jwtSecretKey);
    }
    catch (error) {
      logger.error(error);
      accessTokenCookie.errors.push(new Error('unable to verify access token cookie'))
      break verifyCookieGuard;
    }

    // ensure payload is an object
    if (typeof accessTokenPayload === 'string') {
      logger.error('access token payload is a string');
      accessTokenCookie.errors.push(new Error('access token payload is not an object'));
      break verifyCookieGuard;
    }

    // ensure payload has a "sub" property
    const sub = accessTokenPayload.sub;
    if (typeof sub !== 'string') {
      logger.error('access token payload sub is not a string');
      accessTokenCookie.errors.push(new Error('access token payload sub is not a string'));
      break verifyCookieGuard;
    }

    // if no required permissions, user is authorised
    //
    // TODO: check for user permissions in the databases
    let permissions: Array<string> = [];
    try {
      // permissions = await
    }
    catch (error) {
      logger.error(error);
      accessTokenCookie.errors.push(new Error('unable to fetch user permissions from database'));
      break verifyCookieGuard;
    }
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
