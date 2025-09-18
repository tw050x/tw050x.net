import { logger } from "@tw050x.net.library/logger";
import { ServiceContext } from "@tw050x.net.library/service";
import { default as Cookies } from "cookies";
import { addHours, differenceInSeconds } from "date-fns";

declare module "node:http" {
  interface ServerResponse {
    accessTokenCookie: {
      clear: () => void;
      set: (value: string) => void;
    }
  }
}

type UseAccessTokenCookieWriterOptions = {
  getConfiguration: (context: { configuration: ServiceContext['configuration'] }) => Promise<{
    cookieName: string;
    cookieDomain: string;
  }>;
}

/**
 * @returns void
 */
export const useAccessTokenCookieWriter = (options: UseAccessTokenCookieWriterOptions) => async (context: ServiceContext) => {
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
  const clearAccessTokenCookie = () => {
    cookies.set(cookieName, '', {
      domain: cookieDomain,
      httpOnly: false,
      path: '/',
      sameSite: 'strict',
      secure: true,
    });
  }
  const setAccessTokenCookie = (value: string) => {
    const currentDate = new Date();
    const expiryDate = addHours(currentDate, 3);
    const maxAgeInSeconds = differenceInSeconds(expiryDate, currentDate);
    const maxAgeInMilliseconds = maxAgeInSeconds * 1000;
    cookies.set(cookieName, value, {
      domain: cookieDomain,
      httpOnly: false,
      maxAge: maxAgeInMilliseconds,
      path: '/',
      sameSite: 'strict',
      secure: true,
    });
  }
  // initialize the cookies object on the incoming message
  context.serverResponse.accessTokenCookie = {
    clear: clearAccessTokenCookie,
    set: setAccessTokenCookie
  };
}
