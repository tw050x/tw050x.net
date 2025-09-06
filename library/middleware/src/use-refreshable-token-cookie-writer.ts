import { logger } from "@tw050x.net.library/logger";
import { ServiceContext } from "@tw050x.net.library/service";
import { default as Cookies } from "cookies";
import { addDays, differenceInSeconds } from "date-fns";

declare module "node:http" {
  interface ServerResponse {
    refreshableTokenCookie: {
      clear: () => void;
      set: (value: string) => void;
    }
  }
}

type UseRefreshableTokenCookieOptions = {
  getConfiguration: (context: ServiceContext['configuration']) => Promise<{
    cookieName: string;
    cookieDomain: string;
  }>;
}

/**
 * @returns void
 */
export const useRefreshableTokenCookieWriter = (options: UseRefreshableTokenCookieOptions) => async (context: ServiceContext) => {
  const cookies = new Cookies(context.incomingMessage, context.serverResponse, {
    secure: true,
  });

  let configuration;

  try {
    configuration = await options.getConfiguration(context.configuration);
  }
  catch (error) {
    logger.error('unable to read access token cookie', { error });
    context.serverResponse.statusCode = 500;
    return void context.serverResponse.end();
  }

  const cookieName = configuration.cookieName;
  const cookieDomain = configuration.cookieDomain;

  const clearRefreshableTokenCookie = () => {
    cookies.set(cookieName, '', {
      domain: cookieDomain,
      httpOnly: false,
      path: '/',
      sameSite: 'lax',
      secure: true,
    });
  }

  const setRefreshableTokenCookie = (value: string) => {
    const currentDate = new Date();
    const expiryDate = addDays(currentDate, 7);
    const maxAgeInSeconds = differenceInSeconds(expiryDate, currentDate);
    const maxAgeInMilliseconds = maxAgeInSeconds * 1000;
    cookies.set(cookieName, value, {
      domain: cookieDomain,
      httpOnly: false,
      maxAge: maxAgeInMilliseconds,
      path: '/',
      sameSite: 'lax',
      secure: true,
    });
  }

  // initialize the cookies object on the incoming message
  context.serverResponse.refreshableTokenCookie = {
    clear: clearRefreshableTokenCookie,
    set: setRefreshableTokenCookie
  };
}
