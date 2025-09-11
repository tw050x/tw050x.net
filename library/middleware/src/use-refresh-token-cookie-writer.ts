import { logger } from "@tw050x.net.library/logger";
import { ServiceContext } from "@tw050x.net.library/service";
import { default as Cookies } from "cookies";
import { addDays, differenceInSeconds } from "date-fns";

declare module "node:http" {
  interface ServerResponse {
    refreshTokenCookie: {
      clear: () => void;
      set: (value: string) => void;
    }
  }
}

type UseRefreshTokenCookieWriterOptions = {
  getConfiguration: (context: { configuration: ServiceContext['configuration'] }) => Promise<{
    cookieName: string;
    cookieDomain: string;
  }>;
}

/**
 * @returns void
 */
export const useRefreshTokenCookieWriter = (options: UseRefreshTokenCookieWriterOptions) => async (context: ServiceContext) => {
  const cookies = new Cookies(context.incomingMessage, context.serverResponse, {
    secure: true,
  });

  let configuration;

  try {
    configuration = await options.getConfiguration({ configuration: context.configuration });
  }
  catch (error) {
    logger.error('unable to read access token cookie', { error });
    context.serverResponse.statusCode = 500;
    return void context.serverResponse.end();
  }

  const cookieName = configuration.cookieName;
  const cookieDomain = configuration.cookieDomain;

  const clearRefreshTokenCookie = () => {
    cookies.set(cookieName, '', {
      domain: cookieDomain,
      httpOnly: true,
      path: '/token/refresh',
      sameSite: 'strict',
      secure: true,
    });
  }

  const setRefreshTokenCookie = (value: string) => {
    const currentDate = new Date();
    const expiryDate = addDays(currentDate, 7);
    const maxAgeInSeconds = differenceInSeconds(expiryDate, currentDate);
    const maxAgeInMilliseconds = maxAgeInSeconds * 1000;
    cookies.set(cookieName, value, {
      domain: cookieDomain,
      httpOnly: true,
      maxAge: maxAgeInMilliseconds,
      path: '/token/refresh',
      sameSite: 'strict',
      secure: true,
    });
  }

  // initialize the cookies object on the incoming message
  context.serverResponse.refreshTokenCookie = {
    clear: clearRefreshTokenCookie,
    set: setRefreshTokenCookie
  };
}
